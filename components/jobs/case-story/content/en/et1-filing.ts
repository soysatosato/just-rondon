import type { CaseStoryArticle } from "../../types";

export const et1Filing: CaseStoryArticle = {
  slug: "et1-filing",
  title: "Submitting the ET1 claim form",
  engTitle: "ET1を提出する",
  summary:
    "Once Acas has not resolved it, this is where you formally bring a claim in the Employment Tribunal. From here on it is not a query — it is a case.",
  description:
    "A record of submitting an ET1 to the Employment Tribunal against Tenshi61 LTD: the deadline, the Acas certificate number, how to word the particulars of claim, the remedy sought, and requesting an interpreter.",
  keywords: [
    "how to fill in ET1",
    "Employment Tribunal claim",
    "ET1 time limit",
    "employment tribunal UK",
    "ET1 interpreter request",
  ],
  mainText: `Because Early Conciliation did not resolve matters, the next step was **submitting an ET1 to the Employment Tribunal**.

The ET1 is the form used to bring a formal claim in the Employment Tribunal. From here on, it is not a query — it is treated as **a formal case**.

You can submit it online, and **there is no fee to bring a claim**.

This chapter sets out how I organised each section when I actually filed.`,
  sections: [
    {
      title: "Check the deadline first",
      subtitle: "Miss this and it is over, however good your evidence",
      body: `The thing to watch most carefully on an ET1 is the **time limit**.

A claim for unpaid wages must generally be brought within **three months less one day** of the date the problem arose. The period spent in Acas Early Conciliation is excluded from that calculation, and the remaining time starts running once the certificate is issued.

The arithmetic is slightly fiddly, so in practice the safe way to think about it is:

**Once the certificate arrives, file immediately.**

I submitted about **ten days** after the certificate was issued.

To repeat, waiting for any of these reasons is dangerous:

- the other side says they will put forward a settlement proposal
- it feels like a bit more negotiation would resolve it
- you want to perfect the paperwork before filing

On the third point: **you do not need to attach evidence at the ET1 stage.** Evidence comes later. All the ET1 needs is an explanation of what you are claiming, how much, and why.

Waiting for perfection and missing the deadline is the most wasteful way to lose.`,
    },
    {
      title: "The Acas certificate number is mandatory",
      subtitle: "Without it the claim is not accepted",
      body: `The ET1 has a field for the **reference number from the Acas Early Conciliation certificate**.

It is mandatory. A claim that has not been through Acas will not normally be accepted.

When filling it in, **copy it exactly as it appears on the certificate** — including the format and the position of any hyphens.

The **respondent's name** on the certificate must also match the respondent's name on the ET1. A mismatch causes procedural problems later.`,
    },
    {
      title: "Name the respondent by its registered company name",
      subtitle: "Identify the legal entity, not the trading name",
      body: `This is an unglamorous point that matters later.

The Respondent you name is **the legal entity that employed you**, not the name over the door.

In my case the restaurant is called **Tenshi**, but the employer I brought the claim against was the operating company, **Tenshi61 LTD**.

You can search the registered name and registered office free of charge at **Companies House**. They are often on your payslip and P60 as well.

There are two reasons to check this.

1. **So the papers actually arrive.** Nothing progresses unless the respondent is served.
2. **For later enforcement.** If the judgment is not paid, it is the company you enforce against. If the entity is not properly identified, you get stuck there.

While you are at Companies House, it is also worth looking at the company's status (active, in liquidation, and so on). I come back to this in a later chapter.`,
    },
    {
      title: "Get the dates and the job right",
      subtitle: "This is the foundation of the later calculation",
      body: `You enter your start and end dates of employment, and what the job was.

I worked front of house, so that is what I put.

**The employment dates you enter here feed directly into the later calculation of the claim.** In my case, the **number of days actually worked** during the employment was the basis for the figure.

So it helps, at this stage, to confirm from your rotas and payslips:

- the dates you worked between
- how many days you actually worked in that period

Note that **any worker can claim unpaid wages**, whatever the arrangement — full-time, part-time, zero-hours. Being on a zero-hours contract does not stop you claiming.`,
    },
    {
      title: "The claim details set out the background and the basis of the figure",
      subtitle: "Write the structure, not the feeling",
      body: `This is the heart of the ET1: what happened, why it is unlawful, and how much you are claiming.

What I wrote was broadly structured like this:

1. **The facts** — a 12.5% service charge was added to bills
2. **The problem** — no explanation, written or verbal, of how it was allocated
3. **The reality** — what was actually paid did not appear proportionate to what was collected
4. **The legal basis** — the service charge in substance formed part of wages, so the shortfall is unpaid wages
5. **The figure** — the amount claimed and how it was calculated

On point 4: I argued that the service charge was **in substance part of my remuneration**. The basis was:

- it was paid **regularly** throughout my employment
- it was processed **through payroll**
- it appeared **on my payslip as income**

In other words, it was not an occasional discretionary gratuity — it was treated as wages.

One point on style.

**Do not write emotionally.**

I understand the urge. But a tribunal reads submissions, not impressions. Written plainly and structurally, it reads more strongly.

Not "I was treated appallingly", but "a 12.5% charge was collected, there was no written allocation rule, and there is a gap between the figure derived from the records and what was actually paid." The second is much harder to argue with.`,
    },
    {
      title: "The remedy sought is compensation",
      subtitle: "Be clear about what you want the tribunal to do",
      body: `In the remedy section you choose what you are asking the tribunal for.

I sought **compensation** — payment of the shortfall.

For an unpaid wages claim, that is the standard.

You enter a figure here, and the convention is to **state it gross** (before tax and National Insurance). That is how the tribunal works in practice.

My claim was **£4,007.55 (gross)**. How that number was arrived at is set out in full in "[Work out what you are owed](/en/jobs/service-charges/case-story/check-your-service-charge)".

When you state a figure, **state one you can justify**. Not "about £5,000", but the number that came out of the calculation, pence included. A figure with odd pence in it is itself evidence that you did the arithmetic.

Note also that if you are paid under a judgment, **you are responsible for declaring the tax and NI on it to HMRC yourself**. I come back to this in a later chapter.`,
    },
    {
      title: "If you are not confident in English, request an interpreter",
      subtitle: "There was no cost to me",
      body: `The ET1 has a section for adjustments you need for the hearing.

I was not confident in English, so I stated that I **wanted a Japanese–English interpreter**.

In the event, **the tribunal arranged one** — and **I was not charged for it**.

That helped enormously.

If your English is shaky, do not force yourself to say you will be fine. Setting out the support you need from the start means you actually get your case across accurately.

The same section lets you request wheelchair access and other adjustments.

> For the record, across this whole account I did not instruct a solicitor. I attended the hearing in person.
> Neither the claim nor the interpreter cost me anything.`,
    },
    {
      title: "After filing, you get a case number",
      subtitle: "The respondent then has 28 days to respond",
      body: `On submission, the tribunal sends an acknowledgement and assigns a **case number**.

Use it in all correspondence from then on. In practice, put it in the email subject line too.

The tribunal then sends a copy of the claim to the respondent. In my case, that happened **about three weeks after filing**.

That is when the respondent's clock starts.

**The respondent must file an ET3 (response) within 28 days of the claim being sent to them.**

That 28-day period is set by the rules, and it matters.

If no response is filed by the deadline, **the tribunal can issue a judgment without one** (Rule 22).

That is exactly what happened in my case. It is covered in "[No response, hearing, judgment](/en/jobs/service-charges/case-story/default-judgment)".

The notice you receive after filing contains a map of the whole procedure ahead. The next chapter sets out what to look for in it.`,
    },
  ],
};
