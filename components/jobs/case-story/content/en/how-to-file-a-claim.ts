import type { CaseStoryArticle } from "../../types";

export const howToFileAClaim: CaseStoryArticle = {
  slug: "how-to-file-a-claim",
  title: "How to bring a claim, end to end",
  engTitle: "申立ての進め方（まとめ）",
  summary:
    "The whole route, from raising it at work to getting paid. Deadlines at each stage, what it actually cost, a document checklist, and the things not to do.",
  description:
    "A complete walkthrough, based on experience, of bringing an Employment Tribunal claim for unpaid service charge: deadlines, costs, the documents you need, and the pitfalls.",
  keywords: [
    "how Employment Tribunal works",
    "claiming unpaid wages UK",
    "Acas ET1 process",
    "employment tribunal cost",
    "service charge claim steps",
  ],
  mainText: `This chapter reorders everything above into the sequence you would actually follow.

The whole picture first:

**Raise it at work → Acas Early Conciliation → certificate → file the ET1 → the respondent's response period → evidence → hearing → judgment → (if unpaid) enforcement**

In my case, roughly eight months passed between first raising the issue and judgment, and several more before recovery began to move.

**It is not a sprint.** But what you have to do at each stage is not especially complicated.`,
  sections: [
    {
      title: "The full route and the deadline at each stage",
      subtitle: "Three deadlines you cannot miss",
      body: `| Stage | What you do | Deadline |
|---|---|---|
| 1 | Raise it at work and leave a record | — |
| 2 | Notify Acas Early Conciliation | Start within **3 months less 1 day** of the issue arising |
| 3 | Deal with the conciliator | — |
| 4 | Certificate issued | Issued if no resolution |
| 5 | **File the ET1** | **Within the time remaining after the certificate.** File immediately |
| 6 | Tribunal sends the claim to the respondent | A few weeks after filing |
| 7 | Respondent's response (ET3) | **Within 28 days** of being sent |
| 8 | **Send evidence to the respondent** | The deadline in the notice |
| 9 | **Send evidence to the tribunal** | Up to **7 days before** the hearing (a separate deadline) |
| 10 | Hearing | — |
| 11 | Judgment | Payment usually due within about 14 days |
| 12 | Enforcement | Start once the payment deadline passes |

**Three deadlines deserve particular attention.**

1. **The deadline for notifying Acas.** Three months less one day from when the issue arose. Miss it and you generally cannot claim
2. **The ET1 deadline.** File as soon as the certificate is issued — do not wait
3. **The deadline for sending to the tribunal.** It is **a separate deadline** from sending to the respondent, and easy to miss

> Calculating time limits can get complicated. Where underpayment is ongoing, there can be argument about when the clock starts.
> **If in doubt, notify Acas early.** Filing early never hurts you.`,
    },
    {
      title: "What it actually cost",
      subtitle: "My own outlay was £80",
      body: `People ask about this, so to be explicit:

| Item | Cost |
|---|---|
| Acas Early Conciliation | **Free** |
| Filing the ET1 | **Free** |
| Attending the hearing | **Free** |
| Interpreter (arranged by the tribunal) | **Free** |
| Solicitor | **Not used** — I acted in person |
| High Court writ issue cost | **£80** (advanced; added to the debtor) |
| HCEO fees | **Borne by the debtor** |

**What I actually paid out was advancing £80 for the writ.**

Employment Tribunals in the UK currently charge **no issue fee**. Fees were introduced at one point but were later held unlawful and abolished.

So **the financial barrier is close to nil.**

What it costs is time and effort. Those it does cost.`,
    },
    {
      title: "Document checklist",
      subtitle: "What you need at each stage",
      body: `**Notifying Acas**

- Your name and contact details
- The respondent's **registered company name** and registered office (check Companies House)
- A short summary of the issue
- Your preferred contact method (and say so if you are not confident in English)

**Filing the ET1**

- The Acas certificate reference number (**copied exactly**)
- The respondent's registered name and address
- Start and end dates of employment
- Your job
- The claim and its basis (claim details)
- The amount claimed (**gross**)
- The remedy sought (compensation)
- Any request for an interpreter or other adjustments

*You do not need to attach evidence to the ET1.*

**Producing evidence**

- Assemble it as one set with **an index**
- Schedule of loss (the claim and the method explained)
- Calculation table (daily figures and the working)
- Daily sales reports (Z reports)
- Rotas (both kitchen and front of house)
- Payslips
- Total days actually worked
- Witness statements, if any
- **A record of what you sent the respondent** (date, time, method)

**If the tribunal asks for a schedule of loss**

- Weekly pay (both gross and net)
- The amount claimed and how it is calculated (including the period, gross)
- The method for any other heads of claim`,
    },
    {
      title: "What not to do",
      subtitle: "What I watched for, and where I nearly slipped",
      body: `**1. Letting a deadline slide because settlement looks close**

The most dangerous one. "They say they are going to make an offer" does not stop the clock. You can still settle after filing the ET1. **File first, then negotiate.**

**2. Writing emotionally**

The urge is understandable, but the tribunal decides the substance of the claim. Plain, structured writing reads more strongly. When emotional emails arrive from the other side, answering with facts alone is enough.

**3. Chasing Acas too hard**

Acas is neutral. Frequent chasing can read as anxious or emotional. Wait a reasonable period, then ask briefly and politely.

**4. Disclosing all your evidence early**

Early Conciliation explores settlement; it is not formal disclosure. Showing everything at that stage gives the other side time to prepare a response. **Produce it at the right stage, in the right form.**

**5. Widening the claim too far**

However many things you want to say, narrowing to **the one point you can evidence and reduce to a figure** ends up stronger. I left out unfair dismissal and ran unpaid wages alone.

**6. Not recording service**

"I'm sure I sent it" does not work. Record the date, time, method, and recipient. If you use a large-file link, watch the **expiry date**.

**7. Assuming it ends at judgment**

Judgments do not pay themselves. Once the payment deadline passes, start preparing the next step.

**8. Underestimating the risk to colleagues**

If someone helps with witness evidence, think first about whether it exposes them. Be especially careful with people still employed there.`,
    },
    {
      title: "Deciding whether you have a claim",
      subtitle: "Three questions",
      body: `**Question 1 — was the service charge in substance part of your pay?**

Likely yes if:

- it was paid **regularly**
- it went **through payroll**
- it appeared **on your payslip**

That is treated differently from occasional cash gratuities.

**Question 2 — was the allocation rule written down?**

- **Not written down** → there is scope to calculate by a method verifiable from the records. The burden of showing a rule existed falls on the party that should have kept the records
- **Written down** → calculate according to that rule. If you were not paid in accordance with it, that is itself the problem

**Question 3 — can you secure the records?**

At minimum you need three things:

- something showing the daily total service charge
- something showing how many staff worked each day
- something showing what was actually paid to you

**If you are still employed, start collecting now.** It gets much harder after you leave.

**You do not need the whole period.** One month with complete records, plus an unchanged practice across the period, may serve as a reference month.

If all three apply, it is worth doing the arithmetic. The method is in "[Work out what you are owed](/en/jobs/service-charges/case-story/check-your-service-charge)".`,
    },
    {
      title: "Finally",
      subtitle: "What I think, having done it",
      body: `Looking back, a few things.

**It can be done without a solicitor.**
Both Acas and the tribunal explain things on the assumption that people act for themselves. If your English is shaky, an interpreter can be arranged.

**The more level-headed I stayed, the stronger it got.**
Not engaging with emotional exchanges and simply stacking up facts and figures turned out to be more persuasive.

**It took a long time.**
About eight months from first raising it to judgment, and longer again before recovery moved. Along the way a notice arrived in error, and unpleasant emails arrived from the other side.

**But the record stands.**
Whatever happens from here, **there is a tribunal decision on the record about how a service charge collected from customers was allocated**.

If someone in the same position can use this record to produce their own numbers, writing it was worth it.

> For completeness: the respondent **said** they had applied to the court to set this judgment aside.
> No copy of any application ever reached me or the HCEO handling enforcement. The stay of enforcement they sought was **dismissed by the court on 6 August 2026**, on the basis that there was no evidence any set-aside application had actually been made.
> If an application was in fact made and were granted, the outcome could change. I am recording that honestly too.`,
    },
  ],
};
