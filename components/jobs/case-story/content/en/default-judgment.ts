import type { CaseStoryArticle } from "../../types";

export const defaultJudgment: CaseStoryArticle = {
  slug: "default-judgment",
  title: "No response, the hearing, and the judgment",
  engTitle: "答弁なし・審理・判決",
  summary:
    "What happens when the respondent files no response. What I did when a notice arrived in error. The online hearing, and a judgment of £4,007.55.",
  description:
    "A record of how the respondent's failure to file a response opened the way to a Rule 22 judgment, and how the hearing led to an order to pay £4,007.55 in unpaid service charge.",
  keywords: [
    "Rule 22 judgment",
    "Employment Tribunal no response filed",
    "default judgment UK",
    "CVP tribunal hearing",
    "Employment Tribunal interest",
  ],
  mainText: `The respondent did not file a response (ET3) by the deadline.

Despite having written substantive arguments to me by email, **they put nothing before the tribunal**.

This chapter sets out what happened from there to judgment.
Along the way, the tribunal sent me a notice **in error**. I have written that part up in detail, in case someone in the same position runs into the same thing.`,
  sections: [
    {
      title: "If no response is filed, Rule 22 becomes available",
      subtitle: "It does not mean you win automatically",
      body: `Because the respondent had not filed a response in time, the tribunal issued a notice to them. In substance:

> You have not presented a response to this claim.
>
> Under Rule 22 of the Employment Tribunal Rules of Procedure, **a judgment may be issued**.
> You are entitled to notice of the hearing, but may only participate to the extent permitted by the judge.

There is an easy misunderstanding here.

**The absence of a response does not mean the amount claimed is automatically awarded.**

Rule 22 means the tribunal can decide without waiting for a response. It does not mean the claimant's figure goes through unexamined.

**You still have to establish the basis for the sum claimed.**

Indeed, I was subsequently required to set out my calculation in writing, and I gave evidence at the hearing.

So even if the other side is silent, do not ease off on the preparation.`,
    },
    {
      title: "The notice that arrived in error",
      subtitle: "Even tribunal notices can be wrong",
      body: `As the hearing date approached, a notice arrived from the tribunal. Its contents were alarming.

> Because the respondent has entered compulsory liquidation, your claim is **stayed**. The listed hearing has been **cancelled**.
>
> You may not continue the claim without the permission of the court.

Receiving that after all the preparation is, frankly, hard to take.

Then, **two days later**, another notice arrived from the tribunal.

> The previous correspondence was **sent in error**. Your claim is not stayed and the hearing has not been cancelled.

So the first notice had simply been wrong.

**Two lessons from this.**

1. **Official bodies get things wrong too.** If something does not sit right, or does not square with what has happened so far, you are entitled to check.
2. **Do not give up the moment a notice arrives.** Had I stopped on receiving that one, none of what followed would have happened.

That said, **if the respondent genuinely does enter liquidation, the position changes**. You then need the court's permission to continue, and the prospects of recovery change substantially. It is worth checking the respondent's status at Companies House from time to time.`,
    },
    {
      title: "If they really had gone into liquidation",
      subtitle: "Reporting to the Insolvency Service, and the risk to the other side",
      body: `If the respondent had in fact entered compulsory liquidation, it would not end there. **There is a route of reporting the circumstances of the liquidation itself to the Insolvency Service.**

In the UK, when a company goes into liquidation the process is handled by the **Official Receiver**, who can investigate the **conduct of the directors** in the period leading up to it.

The kinds of fact you can report include:

- that liquidation was entered immediately before a tribunal judgment was due
- that the same directors are involved in several similar companies incorporated around the same time
- that after liquidation, trading appears to continue at the same address, in the same line of business, with substantially the same staff

These can be put to the Official Receiver's regional office by email (for example London1.OR@insolvency.gov.uk) as **facts raising a concern that directors are using companies as disposable vehicles to escape debts, including judgments**. I did this myself, setting out the facts on the basis of the stay notice from the tribunal and the company's subsequent trading.

The important framing here is that this is **providing facts, not making an accusation**. You are not asserting that directors acted dishonestly; you are giving a public body the material to decide whether the matter merits investigation.

**The risks to the other side**, if an investigation follows, include:

- **Director disqualification** — under the Company Directors Disqualification Act 1986, potentially for up to 15 years
- **Personal liability** — if the liquidation is found to have been designed to defeat creditors, or to amount to wrongful or fraudulent trading, **directors can be made personally liable for the company's debts**
- **Criminal proceedings** — in serious cases the Insolvency Service can refer matters to the prosecuting authorities

That said, these are **possible outcomes of an investigation**. Making a report does not automatically trigger anything.

In fact, the reply I received when I sent my report was this:

> I am unable to trace the company on our systems, and the data on companies house does not suggest this company is in liquidation.
>
> The official receiver can only deal with enquiries on cases where an order has been made.

In other words: **Companies House did not yet show liquidation proceedings, and the company could not be found on the Insolvency Service's systems either**.

The lessons:

- **The Official Receiver can only act on cases where an order has actually been made.** A tribunal notice saying the other side has gone into liquidation may not, on its own, put the matter within scope
- **The Companies House register and tribunal notices do not necessarily update at the same time.** In my case, the tribunal had sent a stay notice on the basis of liquidation while Companies House still showed the company as "active"
- **Report once the liquidation is visible at Companies House.** Too early and the answer is simply "no trace"

So if you find yourself in the same position, the reliable order is to **wait until the liquidation is actually reflected on the Companies House register**, and then report the facts to the Insolvency Service.`,
    },
    {
      title: '"Set out the basis of your figure in writing"',
      subtitle: "Seven days. Cut corners here and the hearing drags",
      body: `In the same notice that corrected the error, the tribunal gave specific directions.

In substance:

> The respondent has not presented a response within the 28 days prescribed by the rules. **A judgment may therefore be issued**, which would remove the need for you to attend and give evidence at a hearing.
>
> However, the judge cannot make that decision **unless you set out in writing what you are claiming and how the figure was calculated**.
>
> Within **seven days**, please provide the following in writing:
>
> 1. Your weekly pay **before and after** tax and National Insurance
> 2. The amount claimed as unpaid wages and **how it is calculated** (including the period). Use the **gross** weekly figure
> 3. If claiming accrued untaken holiday, the amount and how it is calculated (also gross)
> 4. If claiming notice pay, the amount and the basis. Use the **net** weekly figure for this calculation
> 5. If you took other work during the notice period, your net earnings for that period
> 6. Any benefits received during the notice period

Since I had narrowed to unpaid wages alone, what I mainly had to answer was point 2.

What I submitted was a document in two parts:

- **A schedule of loss** — how the claim is framed, why the service charge forms part of wages, why the calculation is done gross, and what source material was used
- **A calculation table** — the daily figures and the working that produces the total

Handling that properly is, I think, what kept the hearing short.

**Produce what was asked for, in the form asked for, within the time asked for.** That is the whole of it.`,
    },
    {
      title: "The hearing was online, with an interpreter",
      subtitle: "In person, unrepresented",
      body: `The hearing was held **online via CVP (Cloud Video Platform)**, before the London Central tribunal.

Who was present:

- The claimant (me) — **in person, unrepresented**
- The respondent — **did not attend, and had filed no response**
- An interpreter — arranged by the tribunal (Japanese–English)
- One judge

Having requested an interpreter on the ET1 paid off here. There was no cost to me.

A few things I noticed about online hearings, having done one:

- **Test your connection in advance.** Joining instructions arrive beforehand — try them the day before, not on the day
- **Get a quiet room and a stable connection.** Audio quality matters especially when an interpreter is involved
- **Have your documents to hand on paper or a second screen.** Safer than relying on screen sharing
- **With an interpreter, everything takes twice as long.** Don't rush; speak in short segments

What I was asked to do was **give evidence that the sum claimed was correct**, working through the schedule of loss and calculation table I had already submitted.`,
    },
    {
      title: "Judgment — £4,007.55",
      subtitle: "One claim succeeded: unpaid wages",
      body: `Judgment was given on the day of the hearing.

**The respondent shall pay the claimant £4,007.55.**

The date for payment was set at roughly two weeks after the written judgment was sent out.

The reasons record the following:

- the claim was brought as one for "other payments"
- parts of the ET1 read as though **automatic unfair dismissal** was also being claimed, but the claimant had not ticked the relevant box, and **confirmed at the hearing that no such claim was being made**
- the claim was sent to the respondent's address but **no response was received**. A judgment was therefore entered under Rule 22
- the claimant confirmed in evidence that **£4,007.55 (gross)** was payable as unpaid wages (unpaid service charge)
- on receiving the judgment sum, the claimant **is responsible for declaring the tax and National Insurance due on it to HMRC**

The last point is easy to miss, so it is worth emphasising.

**The judgment sum is gross, not net.**
Once you receive it, the tax treatment is your own responsibility.

Note also that **the written judgment arrived about a month after the hearing**. Judgment is given orally on the day, but the document takes time.`,
    },
    {
      title: "Interest is not automatic — it starts after 14 days",
      subtitle: "Employment Tribunals (Interest) Order 1990",
      body: `Alongside the judgment came **a notice about interest**.

How it works:

- the day the tribunal sends the written judgment to the parties is the **relevant decision day**
- the **following day** is the **calculation day**
- **if the full amount is paid within 14 days of the relevant decision day, no interest accrues**
- if it is not paid in full within 14 days, interest accrues **from the calculation day**
- the rate is the rate under **section 17 of the Judgments Act 1838** — **8% per year**
- interest is **simple**, and accrues **daily** on the outstanding balance

So the respondent has 14 days' grace, after which 8% a year starts running.

A few additional points:

- no interest accrues on the part of the judgment sum paid over to the authorities as tax or NI
- requesting written reasons afterwards does not change the relevant decision day
- if the amount is varied on appeal, interest runs from the calculation day on **the varied amount**

In my case, nothing was paid by the due date.

What happened next is the least-discussed part of this whole account. **Getting a judgment and getting the money are two different things.**

That is the next chapter.`,
    },
    {
      title: 'Note — the respondent says they have applied to set the judgment aside',
      subtitle: "I have seen nothing to support it",
      body: `In fairness, this should be recorded.

Once enforcement began, the respondent started saying they had **applied to the court to set the judgment aside**.

The substance of the assertion is that **they did not receive notice of the hearing and so had no opportunity to defend**.

Let me be precise here.

**All I can confirm is the fact that the respondent says so.**

- **I have not received** a copy of any such application
- The High Court Enforcement Officer handling enforcement **has not received a copy either**
- The court has sent me **no notice of anything**

So I cannot confirm whether an application was actually made. There is only the respondent's account of it.

As a matter of procedure, a respondent can apply to set aside a Rule 22 judgment — one entered without a response. If granted, the case would be heard afresh.

With that in mind, when reading this record:

- **the £4,007.55 judgment stands**, and enforcement has proceeded
- if an application to set aside was in fact made and were granted, **that decision could be overturned**
- but as things stand, **I have received nothing that supports it**

This distinction becomes a live issue in the enforcement chapter that follows.`,
    },
  ],
};
