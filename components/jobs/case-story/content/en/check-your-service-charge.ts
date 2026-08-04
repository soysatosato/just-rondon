import type { CaseStoryArticle } from "../../types";

export const checkYourServiceCharge: CaseStoryArticle = {
  slug: "check-your-service-charge",
  title: "Working out how much service charge you are owed",
  engTitle: "自分の未払い額を計算する",
  summary:
    "The calculation the tribunal actually accepted, published in full. You need three things: the sales records, the rotas, and your payslips.",
  description:
    "A step-by-step version of the unpaid service charge calculation accepted by the Employment Tribunal, with the real figures: what records you need, the formula, how a reference month works, and why you calculate gross.",
  keywords: [
    "how to calculate service charge owed",
    "unpaid tips calculation",
    "service charge claim amount",
    "Z report rota payslip",
    "calculating unpaid wages UK",
  ],
  mainText: `This is the most practical chapter in this record.

I am publishing, in full and with the real figures, the calculation I used — **the one the tribunal accepted**.

You only need three kinds of record.

1. **Daily total sales and total service charge** (POS Z reports)
2. **How many staff worked each day** (rotas)
3. **The service charge actually paid to you** (payslips)

No guesswork. Everything comes from **records the employer created in the ordinary course of business**.

That is the crucial point. If the other side wants to dispute the figures, **they have to dispute their own records**.`,
  sections: [
    {
      title: "The principle — what you are comparing",
      subtitle: '"What you should have received" against "what you did receive"',
      body: `What you are doing is, in essence, a subtraction.

**What you should have received − what you actually received = the shortfall**

The difficulty is deriving the left-hand side.

Where the allocation rule is not written down, there is no standard to refer to. So the approach is this:

> In the absence of any documented allocation rule or identifiable method of calculation,
> treating the charge as **accruing equally to everyone who worked that day**
> is the approach most consistent with how it was operated in practice and with the evidence that actually exists.

So: **that day's total service charge ÷ the number of people who worked that day** is one person's share.

The premises this rests on are worth stating:

- the service charge was **pooled and handled as a lump**
- there was **no per-individual management or allocation**
- weighting by role or performance was **not documented**
- the payslip showed only **a single total figure**

Conversely, **this method does not work at a workplace where a documented weighted allocation rule genuinely exists**. There you would calculate according to that rule.

Whether to include kitchen staff in the headcount is arguable. I **included both kitchen and front of house**, on the basis that covering everyone who actually ran the service that day better reflects how it worked.`,
    },
    {
      title: "Step 1 — work out the per-person share for each day",
      subtitle: "Total service charge ÷ staff on that day",
      body: `Take the daily total service charge from the Z reports, and the headcount for that day from the rotas.

Some extracts from the real figures:

| Day | Total sales | Total service charge | Kitchen | Front | Per person |
|---|---|---|---|---|---|
| Thu | £1,243 | £138 | 2 | 5 | £19.70 |
| Sat | £3,475 | £381 | 2 | 6 | £47.60 |
| Tue | £718 | £73 | 2 | 4 | £12.20 |
| Fri | £3,069 | £335 | 4 | 5 | £37.20 |
| Sat | £4,289 | £475 | 3 | 5 | £59.40 |
| Mon | £1,302 | £144 | 2 | 2 | £36.00 |
| Fri | £3,454 | £374 | 2 | 4 | £62.30 |

The calculation is just this:

**£381 ÷ (2 + 6) = £47.60**

Do it for every trading day in the month you have chosen.

You can see how much it varies — from £12 to £62. That follows from the combination of takings and headcount.

**Then take the average across the whole month.**

In my case that came to **£35.28 a day**.

> For context: that £35.28 is the share of the 12.5% paid by customers attributable to one person working that day.
> What was actually being paid was roughly £1–3 on top of the hourly rate. That gap is the issue in the case.`,
    },
    {
      title: "Step 2 — multiply by the days you actually worked",
      subtitle: "Use days actually worked, not an average",
      body: `Next, count **the days you actually worked** in that month. The rotas give you this.

In my case, **18 days**.

**£35.28 × 18 days = £635.04**

That is what I should have received that month.

The important thing here is to **use days actually worked**. Not "five days a week, so about 22 days a month".

Two reasons.

1. The real count is **accurate**
2. There is **supporting evidence** for it — the rota

Use an estimate and that becomes the thing they attack. Use the real count and there is nothing to argue about.`,
    },
    {
      title: "Step 3 — subtract what was actually paid",
      subtitle: "Look at the service charge line on your payslip",
      body: `From the payslip, find the service charge actually paid that month.

In my case, **£108.50**.

**£635.04 − £108.50 = £526.54**

That is the shortfall for the month.

**£635.04 should have been received; £108.50 was.**

Reduced to a number, the size of the gap is clear: about 17% of what it should have been.

A few things to watch when reading payslips:

- Check whether the service charge appears **as a separate line**. If it is folded into basic pay, you will need to ask for a breakdown
- **Use the gross figure**, not net (reason below)
- If you do not have your payslips, the employer **is obliged to provide them**. You can ask for past ones to be reissued`,
    },
    {
      title: "Step 4 — extend it across the whole employment",
      subtitle: "Convert to a daily rate, then multiply by total days worked",
      body: `You now have a shortfall for one month. Extend it across the employment.

First convert to **a shortfall per day**.

**£526.54 ÷ 18 days = £29.25**

Then multiply by **the total days worked during the employment**. In my case, **137 days**.

**£29.25 × 137 days = £4,007.55**

That is the sum claimed — and **the sum the tribunal awarded**.

The whole calculation in one table:

| Item | Value |
|---|---|
| Proper share per day | £35.28 |
| Days worked in the reference month | 18 |
| Should have received that month | £635.04 |
| Actually paid that month | £108.50 |
| Shortfall for the month | £526.54 |
| Shortfall per day | £29.25 |
| Total days worked during employment | 137 |
| **Total shortfall** | **£4,007.55** |

The strength of this method is that **every stage is based on days actually worked**. No averages, no estimates.`,
    },
    {
      title: "You can do this with only one month of data",
      subtitle: 'What makes a "reference month" hold up',
      body: `This is where I think a lot of people get stuck.

**Almost nobody has complete data for their whole employment.**

Nor did I. I only secured a complete record for one month, because my employment ended while I was still preparing.

The calculation was accepted anyway, because that month satisfied **the conditions for standing as a reference month**.

In my written submission I put it like this:

- it is **a complete calendar month**, with no missing days
- **daily sales reports exist for every day**
- **attendance records exist for every day**
- **a payslip exists**, so what was actually paid can be verified
- **the way the service charge was collected and processed did not change** during the employment

That last condition matters. If the practice changed partway through, the basis for extending one month across the whole period falls away.

So the submission ran:

> This is the only month for which the records are complete and mutually consistent.
> Since the method of operation did not change over the period, it is **the best available evidence** for determining the share attributable to the work actually performed.

**Incomplete data is not a reason to give up.** What you need is to be able to show that **the records for your chosen month are complete** and that **the practice did not change**.`,
    },
    {
      title: "Why you calculate gross",
      subtitle: "Before deductions, not take-home",
      body: `All of the calculation is done **gross** — before tax and National Insurance.

This is how tribunals work in practice for unpaid wages claims. The tribunal's own directions to me specified using the gross figure.

The two numbers you compare are:

- the **gross** service charge that should have been paid
- the **gross** service charge that was actually paid

The judgment sum is also gross.

Which means **you are responsible for paying the tax and NI on what you receive**. The judgment said so expressly.

So the sum you receive is not all yours to keep. Bear that in mind.`,
    },
    {
      title: "Records to gather while you are still employed",
      subtitle: "They get much harder to obtain after you leave",
      body: `This is the part I most want to get across.

**Once you have left, the records you need become far harder to get.**

While you are still there, documents you see in the ordinary course of work are the evidence you will want later.

**High priority:**

- **Daily sales reports (Z reports)** — showing total sales and total service charge. The single most important item
- **Rotas** — who worked each day, both kitchen and front of house
- **Payslips** — the whole period, saved digitally
- **Your own record of shifts** — keep your own note of the days you actually worked

**Strong to have:**

- **A menu or receipt showing the service charge** — evidence of the percentage charged
- **Any reply you got when you asked how allocation worked** — keep it in email or chat
- **Your contract of employment**, if there is one. If there is not, that absence is itself meaningful
- **Colleagues' evidence** — but be careful not to expose them to risk

**On how to keep them:**

- Save to a personal email address or personal cloud **as you go**. Do not leave everything on company devices or accounts
- Take screenshots **with the date and time visible**
- Where possible, **move conversations into chat or email**

> One caution.
> Gathering records can run into staff handbook rules or contractual confidentiality obligations. Keeping **your own data about yourself** (your payslips, your shifts) is not normally a problem, but material containing other people's personal data needs more care.
> If in doubt, check with Acas or Citizens Advice.`,
    },
    {
      title: "Calculation template",
      subtitle: "Put your own numbers in",
      body: `To apply this to your own case:

**Step 1 — pick one reference month**
Choose a month for which the records are complete.

**Step 2 — calculate for each trading day in that month**

\`\`\`
per-person share for the day = total service charge that day ÷ staff working that day
\`\`\`

**Step 3 — take the monthly average**

\`\`\`
proper share per day = sum of daily per-person shares ÷ number of trading days
\`\`\`

**Step 4 — what you should have received that month**

\`\`\`
proper amount = proper share per day × days you worked that month
\`\`\`

**Step 5 — the shortfall for the month**

\`\`\`
monthly shortfall = proper amount − amount actually paid on the payslip (gross)
\`\`\`

**Step 6 — convert to a daily figure**

\`\`\`
shortfall per day = monthly shortfall ÷ days you worked that month
\`\`\`

**Step 7 — extend across the employment**

\`\`\`
sum claimed = shortfall per day × total days worked during employment
\`\`\`

When you submit, **put the working itself in writing**. Do not just give the figures — explain what you did at each step and which document each number came from.

That is exactly how the document I submitted was structured.`,
    },
  ],
};
