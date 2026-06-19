"""
TrainexAI Document Design System — Central PDF Branding Renderer.

All PDF exports routes go through this module. No separate watermark,
header, footer, or card-styling code should exist anywhere else.

Design rules (applied to EVERY PDF):

1. WATERMARK
   - Rendered BEHIND all content (via onPage, not onPageEnd)
   - TrainexAI logo centered + "TRAINEXAI" text below
   - Opacity: 0.10 (range: 0.07–0.10)
   - Same position on every page

2. HEADER
   - TrainexAI logo (left) + document title + subtitle
   - Right side: owner label + period label + generated date/time
   - Separator line below

3. FOOTER
   - Left: "TrainexAI" wordmark + classification label
   - Center: "Page X of Y" (via NumberedCanvas)
   - Right: Reference ID + "Share only with authorized recipients."
   - Separator line above
   - Metadata bar below header separator: document title + version | date

4. CONTENT (tables, cards, invoices, reports)
   - White card backgrounds (opaque — keeps watermark away from data)
   - Padding: 2.7–3mm on all sides
   - Light borders: #dde2e7 (0.35–0.6pt)
   - Alternating row colors: white + #f7f8f9 (when header enabled)
   - Header row: navy background + white text (when header enabled)
   - No text should compete with the background watermark

5. NEW EXPORTS
   - Must add a new `_*_story()` function following the pattern above
   - Must register the template name in render_pdf_document()
   - Must NOT create standalone PDF rendering code elsewhere
"""

import csv
import uuid
from io import BytesIO
from xml.sax.saxutils import escape

from django.http import HttpResponse
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas as pdf_canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    HRFlowable,
    Spacer,
    Table,
    TableStyle,
)


NAVY = colors.HexColor('#17324d')
ORANGE = colors.HexColor('#ef7d00')
TEXT = colors.HexColor('#243247')
MUTED = colors.HexColor('#667085')
LINE = colors.HexColor('#dde2e7')
SURFACE = colors.HexColor('#f7f8f9')
WHITE = colors.white


def document_reference():
    return f'TX-{timezone.localtime().strftime("%Y%m%d")}-{uuid.uuid4().hex[:8].upper()}'


def _draw_logo(canvas, x, y, size, *, alpha=1):
    """Draw the actual TrainexAI logo — navy rounded square + white T + gold accent.

    Matches the SVG in frontend-next/public/logo-mark.svg.
    """
    canvas.saveState()
    r = size * .29  # rounded corner radius
    # Navy rounded square background
    canvas.setFillColor(NAVY)
    canvas.setFillAlpha(alpha)
    canvas.roundRect(x, y, size, size, r, stroke=0, fill=1)
    # White T — crossbar (width 66%, height 12.5%, centered top)
    bar_h = size * .125
    bar_y = y + size * .75 - bar_h
    canvas.setFillColor(colors.white)
    canvas.setFillAlpha(alpha)
    canvas.roundRect(x + size * .17, bar_y, size * .66, bar_h, r * .3, stroke=0, fill=1)
    # White T — stem (width 21%, height 58%)
    stem_w = size * .21
    stem_x = x + (size - stem_w) / 2
    canvas.roundRect(stem_x, y + size * .08, stem_w, size * .67, r * .3, stroke=0, fill=1)
    # Gold accent line at bottom
    accent_w = size * .46
    accent_h = size * .073
    canvas.setFillColor(ORANGE)
    canvas.setFillAlpha(alpha)
    canvas.roundRect(x + (size - accent_w) / 2, y + size * .04, accent_w, accent_h, r * .3, stroke=0, fill=1)
    canvas.restoreState()


def draw_watermark(canvas, doc):
    """Draw the approved background watermark behind all page content.

    Called from _page_branding() via onPage BEFORE content is rendered,
    so the watermark appears BEHIND all tables, cards, and text.
    Watermark opacity should stay within 0.07–0.10 range.
    """
    width, height = A4
    canvas.saveState()
    # Central watermark: logo + brand text at recommended 0.07-0.10 opacity
    # Drawn BEHIND content — controlled here, not in onPageEnd
    watermark_size = 80 * mm
    _draw_logo(
        canvas,
        (width - watermark_size) / 2,
        (height - watermark_size) / 2 + 12 * mm,
        watermark_size,
        alpha=.10,
    )
    # Brand label below the logo
    canvas.setFillColor(NAVY)
    canvas.setFillAlpha(.10)
    canvas.setFont('Helvetica-Bold', 36)
    label = 'TRAINEXAI'
    canvas.drawString((width - stringWidth(label, 'Helvetica-Bold', 36)) / 2, height * .32, label)
    # Confidentiality ring — subtle but present
    canvas.setFont('Helvetica', 9)
    canvas.setFillAlpha(.07)
    confidentiality = str(getattr(doc, 'privacy_label', 'CONFIDENTIAL DOCUMENT'))
    canvas.drawCentredString(width / 2, height * .26, f'CONFIDENTIAL — {confidentiality} — AUTHORIZED RECIPIENTS ONLY')
    canvas.restoreState()


def draw_header(canvas, doc):
    """Draw the repeated report identity and metadata header."""
    width, height = A4
    canvas.saveState()
    _draw_logo(canvas, 16 * mm, height - 34 * mm, 20 * mm)
    canvas.setFillColor(NAVY)
    canvas.setFont('Helvetica-Bold', 19)
    canvas.drawString(43 * mm, height - 21 * mm, doc.document_title)
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 9)
    canvas.drawString(43 * mm, height - 27 * mm, doc.document_subtitle)

    meta_x = 145 * mm
    canvas.setFont('Helvetica-Bold', 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(meta_x, height - 17 * mm, doc.document_owner_label.upper())
    canvas.drawString(meta_x, height - 25 * mm, doc.document_period_label.upper())
    canvas.drawString(meta_x, height - 33 * mm, 'GENERATED')
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(TEXT)
    canvas.drawString(meta_x, height - 20.5 * mm, str(doc.document_owner)[:34])
    canvas.drawString(meta_x, height - 28.5 * mm, str(doc.document_period)[:34])
    canvas.drawString(meta_x, height - 36.5 * mm, doc.generated_at)
    canvas.setStrokeColor(colors.HexColor('#cfd5dc'))
    canvas.line(16 * mm, height - 42 * mm, width - 16 * mm, height - 42 * mm)
    canvas.restoreState()


def draw_footer(canvas, doc, page_number, page_count):
    """Draw the repeated provenance, classification, reference, and page footer."""
    width, height = A4
    canvas.saveState()
    # Bottom line
    canvas.setStrokeColor(colors.HexColor('#cfd5dc'))
    canvas.line(16 * mm, 15 * mm, width - 16 * mm, 15 * mm)
    # Left: brand + classification
    canvas.setFillColor(NAVY)
    canvas.setFont('Helvetica-Bold', 8)
    canvas.drawString(16 * mm, 10 * mm, 'TrainexAI')
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 6)
    classification = str(getattr(doc, 'privacy_label', 'CONFIDENTIAL DOCUMENT')).upper()
    canvas.drawString(16 * mm, 6.5 * mm, classification)
    # Center: page number
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 7)
    page_label = f'Page {page_number} of {page_count}'
    canvas.drawCentredString(width / 2, 10 * mm, page_label)
    # Right: reference + confidentiality warning
    reference = str(getattr(doc, 'reference', 'DRAFT'))
    canvas.setFont('Helvetica', 6.5)
    canvas.drawRightString(width - 16 * mm, 10 * mm, f'Ref: {reference}')
    canvas.setFont('Helvetica', 5.5)
    canvas.drawRightString(width - 16 * mm, 6.5 * mm, 'Share only with authorized recipients.')
    # Top metadata bar: document title + status + version + date
    canvas.setStrokeColor(colors.HexColor('#e2e6ec'))
    canvas.line(16 * mm, height - 44 * mm, width - 16 * mm, height - 44 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 6)
    left_meta = str(getattr(doc, 'document_title', ''))
    right_meta = f"v{getattr(doc, 'document_period', '1')} | {getattr(doc, 'generated_at', '')}"
    canvas.drawString(16 * mm, height - 47.5 * mm, left_meta)
    canvas.drawRightString(width - 16 * mm, height - 47.5 * mm, right_meta)
    canvas.restoreState()


def _page_branding(canvas, doc):
    """Draw watermark FIRST (behind content), then header on top."""
    canvas.saveState()
    canvas.setTitle(doc.document_title)
    canvas.setAuthor('TrainexAI')
    canvas.setSubject(doc.document_subtitle)
    canvas.setCreator('TrainexAI Document System v2')
    canvas.restoreState()
    # Watermark drawn FIRST so content appears ON TOP of it
    draw_watermark(canvas, doc)
    draw_header(canvas, doc)


class NumberedCanvas(pdf_canvas.Canvas):
    """Replay rendered pages to add accurate Page X of Y footers."""

    def __init__(self, *args, document=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.document = document
        self._page_states = []

    def showPage(self):
        self._page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self._page_states)
        for page_number, state in enumerate(self._page_states, start=1):
            self.__dict__.update(state)
            draw_footer(self, self.document, page_number, page_count)
            super().showPage()
        super().save()


def _styles():
    base = getSampleStyleSheet()
    return {
        'section': ParagraphStyle(
            'Section', parent=base['Heading2'], fontName='Helvetica-Bold',
            fontSize=15, leading=18, textColor=NAVY, spaceBefore=5 * mm, spaceAfter=4 * mm,
        ),
        'body': ParagraphStyle(
            'Body', parent=base['BodyText'], fontName='Helvetica',
            fontSize=8, leading=11, textColor=TEXT, alignment=TA_LEFT,
        ),
        'small': ParagraphStyle(
            'Small', parent=base['BodyText'], fontName='Helvetica',
            fontSize=7, leading=9, textColor=MUTED,
        ),
        'header': ParagraphStyle(
            'Header', parent=base['BodyText'], fontName='Helvetica-Bold',
            fontSize=7, leading=9, textColor=colors.white,
        ),
        'metric': ParagraphStyle(
            'Metric', parent=base['BodyText'], fontName='Helvetica-Bold',
            fontSize=17, leading=20, textColor=NAVY,
        ),
    }


def _paragraph(value, style):
    return Paragraph(escape(str(value if value not in (None, '') else '-')), style)


def draw_section_title(label, styles):
    return [
        Paragraph(label, styles['section']),
        HRFlowable(width=12 * mm, thickness=1.2, color=ORANGE, hAlign='LEFT', spaceAfter=4 * mm),
    ]


def draw_table_card(data, column_widths, *, header=True, repeat_rows=1):
    """Return an opaque, padded table card that keeps watermark away from data."""
    table = Table(data, colWidths=column_widths, repeatRows=repeat_rows if header else 0, hAlign='LEFT')
    commands = [
        ('BACKGROUND', (0, 0), (-1, -1), WHITE),
        ('BOX', (0, 0), (-1, -1), .6, LINE),
        ('INNERGRID', (0, 0), (-1, -1), .35, LINE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 3 * mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3 * mm),
        ('TOPPADDING', (0, 0), (-1, -1), 2.7 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.7 * mm),
    ]
    if header:
        commands.extend([
            ('BACKGROUND', (0, 0), (-1, 0), NAVY),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, SURFACE]),
        ])
    table.setStyle(TableStyle(commands))
    return table


def _summary_table(items, styles):
    value_row = []
    label_row = []
    for value, label in items:
        value_row.append(_paragraph(value, styles['metric']))
        label_row.append(_paragraph(label, styles['small']))
    table = draw_table_card([value_row, label_row], [56 * mm] * len(items), header=False, repeat_rows=0)
    table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    return table


def _tabular_story(context, styles):
    columns = context['columns']
    rows = context['rows']
    story = [
        *draw_section_title('Report Summary', styles),
        _summary_table([
            (f'{len(rows):,}', 'Records included'),
            (f'{len(columns):,}', 'Data fields'),
            ('Authorized', 'Access classification'),
        ], styles),
        *draw_section_title('Report Detail', styles),
    ]
    available_width = 178 * mm
    column_widths = [available_width / max(len(columns), 1)] * len(columns)
    data = [[_paragraph(value, styles['header']) for value in columns]]
    data.extend([[_paragraph(value, styles['small']) for value in row] for row in rows])
    table = draw_table_card(data, column_widths)
    story.append(table)
    return story


def _receipt_story(context, styles):
    customer = draw_table_card([
        [_paragraph('BILLED TO', styles['small']), _paragraph('TRANSACTION', styles['small'])],
        [_paragraph(context['customer_name'], styles['body']), _paragraph(context['transaction_id'], styles['body'])],
        [_paragraph(context['customer_email'], styles['small']), _paragraph(context['payment_method'], styles['small'])],
    ], [89 * mm, 89 * mm], header=False, repeat_rows=0)

    base = context.get('base_price', context['amount'])
    disc = context.get('discount', 'INR 0.00')
    gst = context.get('gst_amount', 'INR 0.00')
    fee = context.get('platform_fee', 'INR 0.00')
    final_amt = context.get('final_amount', context['amount'])

    detail = [
        [_paragraph('Description', styles['header']), _paragraph('Subscription period', styles['header']), _paragraph('Amount', styles['header'])],
        [_paragraph(f"{context['plan_name']} Plan", styles['body']), _paragraph(f"{context['start_date']} - {context['end_date']}", styles['body']), _paragraph(base, styles['body'])],
        [_paragraph('Discount', styles['body']), _paragraph('', styles['body']), _paragraph(disc, styles['small'])],
        [_paragraph('Platform Fee (2%%)', styles['body']), _paragraph('', styles['body']), _paragraph(fee, styles['small'])],
        [_paragraph('GST (18%%)', styles['body']), _paragraph('', styles['body']), _paragraph(gst, styles['small'])],
        [_paragraph('Final Amount', styles['metric']), '', _paragraph(final_amt, styles['metric'])],
    ]

    refund_id = context.get('refund_id', '')
    if refund_id:
        detail.append([_paragraph('Refund Status', styles['header']), '', _paragraph('REFUNDED', styles['header'])])
        detail.append([_paragraph('Refund ID', styles['small']), '', _paragraph(refund_id, styles['small'])])
        detail.append([_paragraph('Refund Amount', styles['small']), '', _paragraph(context.get('refund_amount', ''), styles['small'])])

    payment = draw_table_card(detail, [70 * mm, 65 * mm, 43 * mm])
    payment.setStyle(TableStyle([
        ('SPAN', (0, 5), (1, 5)),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return [
        *draw_section_title('Receipt Summary', styles),
        customer,
        *draw_section_title('Payment Detail', styles),
        payment,
    ]


def _studio_document_story(context, styles):
    story = []
    if context.get('recipient'):
        story.extend([
            *draw_section_title('Recipient', styles),
            _paragraph(context['recipient'], styles['body']),
            Spacer(1, 4 * mm),
        ])
    if context.get('subject'):
        story.extend([
            *draw_section_title('Subject', styles),
            _paragraph(context['subject'], styles['body']),
            Spacer(1, 4 * mm),
        ])
    heading = {
        'letter': 'Official Communication',
        'notice': 'Notice',
        'policy': 'Policy Detail',
        'certificate': 'Certification',
        'report': 'Report Narrative',
    }.get(context.get('document_type'), 'Document')
    story.extend(draw_section_title(heading, styles))
    paragraphs = [part.strip() for part in context.get('content', '').split('\n\n') if part.strip()]
    for paragraph in paragraphs or ['No content has been provided.']:
        # Escape HTML entities FIRST, THEN replace newlines with ReportLab line breaks
        safe = escape(paragraph)
        safe = safe.replace('\n', '<br/>')
        story.extend([Paragraph(safe, styles['body']), Spacer(1, 4 * mm)])
    return story


def _workout_plan_story(context, styles):
    """Customer workout plan export with day-by-day exercise breakdown."""
    from reportlab.platypus import Spacer, KeepTogether
    story = [*draw_section_title('Workout Plan Summary', styles)]
    plan = context.get('plan', {})
    days = context.get('days', [])
    rows = [[_paragraph('Day', styles['header']), _paragraph('Split', styles['header']),
             _paragraph('Exercises', styles['header']), _paragraph('Duration', styles['header']),
             _paragraph('Calories', styles['header'])]]
    for day in days:
        ex_names = ', '.join(e.get('name', '') for e in day.get('exercises', []))
        rows.append([
            _paragraph(day.get('day_name', f"Day {day.get('day_index', 0) + 1}"), styles['body']),
            _paragraph(day.get('split', '-'), styles['small']),
            _paragraph(ex_names or '-', styles['small']),
            _paragraph(f"{day.get('estimated_duration_minutes', 0)} min", styles['small']),
            _paragraph(str(day.get('estimated_calories', 0)), styles['small']),
        ])
    available = 178 * mm
    table = draw_table_card(rows, [22 * mm, 28 * mm, 64 * mm, 30 * mm, 20 * mm])
    story.append(table)
    story.append(Spacer(1, 4 * mm))
    story.append(_paragraph(f"Goal: {plan.get('goal', 'N/A')}  |  Level: {plan.get('level', 'N/A')}  |  Equipment: {plan.get('equipment', 'N/A')}", styles['small']))
    return story


def _progress_report_story(context, styles):
    """Customer body progress report with weight, body fat, muscle mass history."""
    story = [*draw_section_title('Progress Report', styles)]
    records = context.get('records', [])
    rows = [[_paragraph('Date', styles['header']), _paragraph('Weight (kg)', styles['header']),
             _paragraph('Body Fat %', styles['header']), _paragraph('Muscle Mass (kg)', styles['header'])]]
    for r in records:
        rows.append([
            _paragraph(str(r.get('date', '')), styles['body']),
            _paragraph(str(r.get('weight_kg', '-')), styles['small']),
            _paragraph(str(r.get('body_fat_percentage', '-')), styles['small']),
            _paragraph(str(r.get('muscle_mass_kg', '-')), styles['small']),
        ])
    if records:
        first = records[0]
        last = records[-1]
        delta = None
        try:
            delta = float(last.get('weight_kg', 0)) - float(first.get('weight_kg', 0))
        except (TypeError, ValueError):
            pass
        story.append(draw_table_card(rows, [44 * mm, 44 * mm, 44 * mm, 44 * mm]))
        if delta is not None:
            story.append(Spacer(1, 4 * mm))
            icon = '+' if delta >= 0 else ''
            story.append(_summary_table([
                (f"{icon}{delta:.1f} kg", 'Weight change'),
                (f"{len(records)}", 'Measurements'),
                (context.get('period', 'All time'), 'Period'),
            ], styles))
    else:
        story.append(_paragraph('No progress records available for the selected period.', styles['body']))
    return story


def _analytics_report_story(context, styles):
    """Customer analytics summary: workouts, daily tracking, streaks."""
    story = [*draw_section_title('Activity Summary', styles)]
    analytics = context.get('analytics', {})
    story.append(_summary_table([
        (str(analytics.get('total_workouts', 0)), 'Total Workouts'),
        (str(analytics.get('total_calories_burned', 0)), 'Calories Burned'),
        (str(analytics.get('avg_duration_minutes', 0)), 'Avg Duration (min)'),
    ], styles))
    story.extend(draw_section_title('Daily Tracking', styles))
    tracking = context.get('daily_tracking', [])
    if tracking:
        rows = [[_paragraph('Date', styles['header']), _paragraph('Water (ml)', styles['header']),
                 _paragraph('Calories', styles['header'])]]
        for t in tracking:
            rows.append([
                _paragraph(str(t.get('date', '')), styles['body']),
                _paragraph(str(t.get('water_ml', 0)), styles['small']),
                _paragraph(str(t.get('calories_intake', 0)), styles['small']),
            ])
        story.append(draw_table_card(rows, [59 * mm, 59 * mm, 59 * mm]))
    else:
        story.append(_paragraph('No daily tracking data available.', styles['body']))
    return story


def _subscription_story(context, styles):
    """Customer subscription and invoice detail."""
    story = [*draw_section_title('Subscription Detail', styles)]
    sub = context.get('subscription', {})
    story.append(_summary_table([
        (sub.get('plan_name', '-'), 'Plan'),
        (sub.get('status', '-'), 'Status'),
        (f"{sub.get('start_date', '')} - {sub.get('end_date', '')}", 'Period'),
    ], styles))
    if sub.get('amount'):
        story.extend(draw_section_title('Payment History', styles))
        payments = context.get('payments', [])
        if payments:
            rows = [[_paragraph('Date', styles['header']), _paragraph('Amount', styles['header']),
                     _paragraph('Status', styles['header'])]]
            for p in payments:
                rows.append([
                    _paragraph(str(p.get('date', '')), styles['body']),
                    _paragraph(f"INR {p.get('amount', 0)}", styles['small']),
                    _paragraph(p.get('status', '-'), styles['small']),
                ])
            story.append(draw_table_card(rows, [59 * mm, 59 * mm, 59 * mm]))
        else:
            story.append(_paragraph('No payment history available.', styles['body']))
    return story


def _policy_document_story(context, styles):
    """Company policy document with numbered sections."""
    story = [*draw_section_title('Policy Document', styles)]
    sections = context.get('sections', [])
    for section in sections:
        story.append(Spacer(1, 3 * mm))
        story.append(Paragraph(f"<b>{section.get('heading', '')}</b>", styles['body']))
        story.append(Spacer(1, 2 * mm))
        body_text = section.get('body', '')
        for para in body_text.split('\\n\\n') if body_text else ['']:
            para = para.strip()
            if para:
                story.append(_paragraph(para.replace('\\n', '<br/>'), styles['small']))
                story.append(Spacer(1, 2 * mm))
    story.append(Spacer(1, 5 * mm))
    story.append(HRFlowable(width=178 * mm, thickness=0.5, color=LINE))
    story.append(Spacer(1, 3 * mm))
    story.append(_paragraph(
        f"Policy version: {context.get('policy_version', '1.0')}  |  "
        f"Effective: {context.get('effective_date', 'N/A')}  |  "
        f"Classification: {context.get('privacy_label', 'Private document')}",
        styles['small']
    ))
    return story


def _data_export_story(context, styles):
    """Customer data export — GDPR-compliant personal data summary."""
    story = [*draw_section_title('Personal Data Export', styles)]
    user_info = context.get('user', {})
    story.append(_summary_table([
        (user_info.get('name', '-'), 'Name'),
        (user_info.get('email', '-'), 'Email'),
        (user_info.get('member_since', '-'), 'Member since'),
    ], styles))
    sections = context.get('data_sections', [])
    for sec in sections:
        story.extend(draw_section_title(sec.get('title', 'Data'), styles))
        rows = sec.get('rows', [])
        if rows:
            columns = list(rows[0].keys()) if rows else []
            header = [_paragraph(c.replace('_', ' ').title(), styles['header']) for c in columns]
            data = [header]
            for row in rows:
                data.append([_paragraph(str(row.get(c, '-')), styles['small']) for c in columns])
            available = 178 * mm
            col_w = [available / max(len(columns), 1)] * len(columns)
            story.append(draw_table_card(data, col_w))
        story.append(Spacer(1, 3 * mm))
    return story


def _gst_invoice_story(context, styles):
    """GST Tax Invoice — replaces the old WeasyPrint HTML invoice template."""
    story = [*draw_section_title('Tax Invoice', styles)]

    # Header: brand info + invoice metadata
    header_data = [
        [_paragraph('TRAINEXAI', styles['metric']), _paragraph('Tax Invoice', styles['metric'])],
        [_paragraph('AI-Powered Fitness Platform', styles['small']),
         _paragraph(f"{context['invoice_no']}  |  {context['date']}", styles['small'])],
        [_paragraph(f"GST: {context['gst_no']}", styles['body']), ''],
    ]
    header_table = draw_table_card(header_data, [89 * mm, 89 * mm], header=False, repeat_rows=0)
    story.append(header_table)
    story.append(Spacer(1, 4 * mm))

    # Bill To + Transaction Details
    info_data = [
        [_paragraph('BILL TO', styles['small']), _paragraph('TRANSACTION DETAILS', styles['small'])],
        [_paragraph(f"<b>{context['customer']}</b>", styles['body']),
         _paragraph(f"<b>Transaction ID:</b> {context['transaction_id']}", styles['small'])],
        [_paragraph(context['email'], styles['small']),
         _paragraph(f"<b>Plan:</b> {context['plan']}", styles['small'])],
    ]
    info_table = draw_table_card(info_data, [89 * mm, 89 * mm], header=False, repeat_rows=0)
    story.append(info_table)
    story.append(Spacer(1, 4 * mm))

    # Line items
    story.append(Paragraph('Invoice Detail', styles['section']))
    line_data = [
        [_paragraph('Description', styles['header']),
         _paragraph('Base Price', styles['header']),
         _paragraph('Discount', styles['header']),
         _paragraph('Taxable', styles['header'])],
        [_paragraph(f"{context['plan']} Subscription", styles['body']),
         _paragraph(f"INR {context['base_price']}", styles['body']),
         _paragraph(f"INR {context['discount']}", styles['body']),
         _paragraph(f"INR {context['taxable']}", styles['body'])],
    ]
    line_table = draw_table_card(line_data, [50 * mm, 42 * mm, 42 * mm, 42 * mm])
    story.append(line_table)
    story.append(Spacer(1, 6 * mm))

    # Totals
    total_data = [
        [_paragraph('Taxable Value', styles['small']), '', _paragraph(f"INR {context['taxable']}", styles['body'])],
        [_paragraph(f"GST ({context['gst_rate']})", styles['small']), '', _paragraph(f"INR {context['gst']}", styles['body'])],
        [_paragraph('Platform Fee', styles['small']), '', _paragraph(f"INR {context['platform_fee']}", styles['body'])],
        [_paragraph(f"Total ({context['currency']})", styles['metric']), '', _paragraph(f"INR {context['final_amount']}", styles['metric'])],
    ]
    total_table = draw_table_card(total_data, [80 * mm, 40 * mm, 56 * mm], header=False, repeat_rows=0)
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#17324d')),
        ('TEXTCOLOR', (0, 3), (-1, 3), colors.white),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8 * mm),
    ]))
    story.append(total_table)
    story.append(Spacer(1, 6 * mm))

    # Footer note
    story.append(HRFlowable(width=178 * mm, thickness=0.5, color=LINE))
    story.append(Spacer(1, 3 * mm))
    story.append(_paragraph(
        f"<b>TrainexAI</b> — GST: {context['gst_no']}  |  "
        f"Invoice: {context['invoice_no']}  |  {context['date']}",
        styles['small']
    ))
    story.append(_paragraph(
        "This is a computer-generated invoice. No signature required. Share only with authorized recipients.",
        styles['small']
    ))
    return story



def render_pdf_document(*, template_name, context, filename, reference=None):
    """Render all visual PDFs through one approved TrainexAI document system."""
    reference = reference or document_reference()
    generated_at = timezone.localtime().strftime('%d %b %Y, %I:%M %p %Z')
    output = BytesIO()
    doc = BaseDocTemplate(
        output,
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=49 * mm,
        bottomMargin=22 * mm,
        title=context['document_title'],
        author='TrainexAI',
    )
    for key, value in {
        'document_title': context['document_title'],
        'document_subtitle': context.get('document_subtitle', ''),
        'document_owner_label': context.get('document_owner_label', 'User'),
        'document_owner': context.get('document_owner', '-'),
        'document_period_label': context.get('document_period_label', 'Report period'),
        'document_period': context.get('document_period', '-'),
        'privacy_label': context.get('privacy_label', 'Private document'),
        'generated_at': generated_at,
        'reference': reference,
    }.items():
        setattr(doc, key, value)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='document')
    doc.addPageTemplates([
        PageTemplate(
            id='TrainexAI',
            frames=[frame],
            onPage=_page_branding,
        ),
    ])

    styles = _styles()
    if template_name == 'documents/tabular_report.html':
        story = _tabular_story(context, styles)
    elif template_name == 'documents/payment_receipt.html':
        story = _receipt_story(context, styles)
    elif template_name == 'documents/studio_document':
        story = _studio_document_story(context, styles)
    elif template_name == 'documents/workout_plan.html':
        story = _workout_plan_story(context, styles)
    elif template_name == 'documents/progress_report.html':
        story = _progress_report_story(context, styles)
    elif template_name == 'documents/analytics_report.html':
        story = _analytics_report_story(context, styles)
    elif template_name == 'documents/subscription.html':
        story = _subscription_story(context, styles)
    elif template_name == 'documents/policy.html':
        story = _policy_document_story(context, styles)
    elif template_name == 'documents/data_export.html':
        story = _data_export_story(context, styles)
    elif template_name == 'documents/gst_invoice.html':
        story = _gst_invoice_story(context, styles)
    else:
        raise ValueError(f'Unsupported document template: {template_name}')
    doc.build(story, canvasmaker=lambda *args, **kwargs: NumberedCanvas(*args, document=doc, **kwargs))

    response = HttpResponse(output.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Cache-Control'] = 'private, no-store'
    response['X-TrainexAI-Report-Reference'] = reference
    response['X-TrainexAI-Document-System'] = 'v2'
    return response, reference


def branded_csv_export(report_name, headers):
    """Add provenance to machine-readable exports without changing their format."""
    exported_at = timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')
    filename = f"trainexai_{report_name}_{timezone.now().date().isoformat()}.csv"
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Cache-Control'] = 'private, no-store'
    response['X-TrainexAI-Export-Source'] = 'TrainexAI'
    writer = csv.writer(response)
    writer.writerow([*headers, 'Export Source', 'Exported At (UTC)'])
    return response, writer, ['TrainexAI', exported_at]
