import type { CaseStoryArticle } from "../../types";

export const highCourtEnforcement: CaseStoryArticle = {
  slug: "high-court-enforcement",
  title: "When you win and still do not get paid",
  engTitle: "勝っても払われないとき",
  summary:
    "A judgment does not pay itself. What comes next is the part most guides leave out: transferring to the High Court, the costs, the respondent's pushback, and the money actually arriving.",
  description:
    "A record of enforcing an unpaid Employment Tribunal judgment by transferring it to a High Court writ: how the costs work, what the enforcement agent did, the respondent's demand to halt enforcement, and the instalment agreement.",
  keywords: [
    "Employment Tribunal judgment not paid",
    "High Court Enforcement",
    "enforcing a judgment UK",
    "writ of control",
    "HCEO fees",
  ],
  mainText: `This is the part I most wanted to write down.

**Getting a judgment and getting the money were completely separate pieces of work.**

The payment deadline passed and nothing arrived.

Most guides stop at the judgment. In reality there is another stage after it. This chapter sets out that stage, with the actual numbers.`,
  sections: [
    {
      title: "The tribunal will not collect for you",
      subtitle: "The body that gives judgment is not the body that recovers",
      body: `There is a blunt fact to understand first.

**The Employment Tribunal does not recover the judgment sum for you.**

Its role ends at deciding what is payable and ordering it. It has no power to collect if the other side does not pay.

And **an Employment Tribunal judgment cannot be enforced as it stands**.

To recover, you have to **transfer the judgment into a court enforcement process**. In England and Wales the main options are:

| Method | What it is |
|---|---|
| **High Court writ of control** | A High Court Enforcement Officer (HCEO) takes control of goods. Available for debts over £1,600 |
| County Court warrant of control | County Court bailiffs act. Aimed at smaller sums, but generally slower |
| Third party debt order | Freezes the debtor's bank account directly. You need the account details |
| Order to obtain information | A procedure to investigate the debtor's means |
| Winding-up petition | Last resort. No guarantee of recovering anything |

Separately, there is also **a free statutory scheme**.

The **Employment Tribunal penalty enforcement and naming scheme**. **42 days** after judgment you can register non-payment free of charge, and a warning notice is sent to the employer. If it is still unpaid **28 days** later, a **penalty of 50% of the judgment sum** plus 8% annual interest can be imposed, and employers who do not pay **can be named publicly on gov.uk**.

If you are not in a hurry to recover, or want to avoid fronting any costs, it is worth considering this route first. The link is in "[Sources and links](/en/jobs/service-charges/case-story/resources-and-links)".

I chose **the High Court writ**.

Three reasons:

1. The judgment sum was over £1,600
2. **HCEOs work on a no-recovery, no-fee basis** — broadly, if nothing is recovered, no fee arises
3. **Enforcement costs are added to the debtor's side**, so they do not come out of my share

The third point matters, so I set it out below.`,
    },
    {
      title: "What it actually cost",
      subtitle: "My own outlay was an £80 advance, and nothing else",
      body: `To have a writ issued you apply to the High Court. I did it through an HCEO firm.

The breakdown on the writ was as follows (at the start of enforcement):

| Item | Amount |
|---|---|
| Judgment sum | £4,007.55 |
| Costs of issue | £80.00 |
| Interest (8% a year, accruing daily) | £75.68 |
| **Claimant's total** | **£4,163.23** |
| HCEO fees | £649.75 |
| **Total on the writ** | **£4,812.98** |

What to notice here is the structure.

**Both the £80 issue cost and the HCEO's fees are added on top of the total demanded from the debtor.**

So if recovery succeeds, what I receive is the "claimant's total" — the judgment sum plus interest — and the enforcement costs fall on the other side.

My actual outlay was **advancing the £80 writ issue cost, and nothing more**.

Note that HCEO fees increase as enforcement progresses. At a later stage they had risen to **£1,243.75**, taking the total on the writ to **£5,413.32**.

**From the debtor's point of view, the longer they drag it out, the more they owe.** That works in your favour in negotiation.`,
    },
    {
      title: "Things move once an agent attends in person",
      subtitle: "The response speed is nothing like correspondence",
      body: `Once the writ is issued, an HCEO enforcement agent attends the debtor's premises.

Looking back over the whole history, the contrast was stark.

- Documents from the tribunal → no response
- Payment deadline → no payment
- **Enforcement agent attends** → **a response the same day**

After the visit, things moved fast. **£1,000 was recovered** at the visit, and a proposal for payment followed.

Correspondence from the enforcement agent included wording like this:

> Our enforcement agent has attended your premises but this matter remains unresolved and a balance is outstanding. **To avoid further visits and further fees**, please contact the case handler urgently.

Where months of correspondence had produced nothing, attending in person produced a result the same day.

That said, it was not all smooth from there.`,
    },
    {
      title: "The respondent demanded that enforcement be halted",
      subtitle: "Enforcement does not stop without a court order",
      body: `As enforcement progressed, the respondent objected.

In substance:

> Our solicitors have **already filed an application with the court to set aside** the decision that gave rise to this debt.
>
> Neither I nor the company **received notice of the hearing**, and we were unable to defend. The judgment was given in our absence in the claimant's favour, and had we been able to attend the outcome would very likely have been different.
>
> Please **halt collection** until a new hearing date is set.

The HCEO's answer was unambiguous.

> **We are unable to place enforcement on hold unless we receive an order from the court or instructions from our client.**

**This is a very important practical point.**

**Saying you have made an application to set aside does not stop enforcement.** To stop it, the court has to actually make **an order staying enforcement**.

"I've filed an application, so please wait" has no legal effect.

If you meet the same situation, this is the point to hold onto: **what stops enforcement is a court order, not the other side's assertion.**

And there is **a further layer** here.

**I cannot confirm that the respondent actually made the application at all.**

- **I have not received** a copy of any application
- **The HCEO handling enforcement has not received a copy either**
- The court has sent me **no notice of anything**

So what is established at this point is **only the fact that the respondent says so**.

That is precisely why enforcement did not stop. If a court makes an order, that order reaches the HCEO. Nothing having reached them means that, at the very least, no decision to stay enforcement has been made.

**Keep the other side's assertions separate from facts you can verify.** In this situation, that was the thing that actually mattered.`,
    },
    {
      title: "Recovered money does not reach you immediately",
      subtitle: "The 14-day statutory embargo period",
      body: `One more mechanism that is confusing if you do not know about it.

**Money recovered by an enforcement agent does not go straight to the claimant.**

The HCEO **holds recovered funds for 14 days**. This is the **statutory embargo period**.

Only after that does payment go out to the claimant.

Processing the payment itself can also take a few days. In practice there were points where the balance shown and the amount actually received looked inconsistent.

**Recovered ≠ in your account.**

Worth knowing in advance so you do not misjudge the timing.`,
    },
    {
      title: "We reached an instalment agreement",
      subtitle: "£1,000 every two weeks",
      body: `As enforcement continued, the respondent proposed a payment arrangement.

**£1,000 every two weeks.**

I agreed, and told the HCEO so.

> I agree to the debtor's proposal of £1,000 every two weeks.
>
> Please notify me when payments are received, and **notify me immediately** if the debtor defaults.

The position at the point of agreement:

| Item | Amount |
|---|---|
| Judgment sum | £4,007.55 |
| Costs of issue | £80.00 |
| Interest | £82.02 |
| **Claimant's total** | **£4,169.57** |
| HCEO fees | £1,243.75 |
| Total on the writ | £5,413.32 |
| Paid to date | −£1,000.00 |
| **Balance** | **£4,413.32** |

Interest keeps accruing at **£0.74 a day** — 8% a year, applied daily. Before the final payment you need to confirm the exact balance with the HCEO.

Before agreeing to instalments, I checked the following:

- **What happens on default.** If payments are missed, the agent can re-attend without prior notice and further fees can arise
- **Whether I would be told promptly on default.** Do not leave monitoring entirely to the HCEO — ask to be told
- **That interest does not stop.** Agreeing to instalments does not stop interest accruing on the balance

> Whether to accept instalments is a judgement call.
> You can hold out for the lump sum and press on with enforcement. But where the other side lacks the means, it can be better to decide on the basis of what is realistically recoverable.`,
    },
    {
      title: "What I learned at this stage",
      subtitle: "Judgment is a waypoint, not the finish line",
      body: `To summarise this chapter:

- **A judgment does not pay itself.** The tribunal will not collect
- **An ET judgment is not directly enforceable.** It has to be transferred into a court enforcement process
- Over £1,600, **a High Court writ** is a realistic option. Enforcement costs are **added to the debtor**
- Your own outlay may be **no more than advancing the writ issue cost**
- **An agent attending in person produces results far faster than paperwork**
- **An assertion that a set-aside application has been made does not stop enforcement.** Stopping it requires a court order
- **Treat the other side's assertions as assertions until they are verified.** With no copy of the application and no notice from the court, all that is established is that it was said
- Recovered money is **held for 14 days** before being paid out
- Interest **keeps accruing daily**. The passage of time is not against you

And the most important thing.

**Do not assume it is over once you have the judgment.**

Realistically, start preparing for the next stage the moment the payment deadline passes. Check the respondent's registered status in parallel — still active, or entering liquidation.

A judgment means your right has been established. Turning it into cash is another job.`,
    },
  ],
};
