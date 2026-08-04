import type { CaseStoryArticle } from "../../types";

export const tribunalCorrespondence: CaseStoryArticle = {
  slug: "tribunal-correspondence",
  title: "Evidence submission and correspondence with the respondent",
  engTitle: "証拠提出と相手方とのやり取り",
  summary:
    "Building the evidence bundle, how to send large files and the traps in doing so, and what to say when you are told \"we never received it, send it again\". Including what happens if you reply without correcting a wrong date the other side has asserted. Practically, this was the stage I learned the most from.",
  description:
    "A record of submitting evidence to the Employment Tribunal and corresponding with the respondent: how the bundle was structured, how to evidence service, and how to answer the respondent's arguments.",
  keywords: [
    "Employment Tribunal evidence",
    "how to prepare a tribunal bundle",
    "service of documents tribunal",
    "service charge allocation argument",
    "employment tribunal document deadlines",
    "responding to respondent emails tribunal",
  ],
  mainText: `Once the ET1 is accepted, the tribunal sends you a notice.

That notice is not just an acknowledgement. It is **a map of the entire procedure ahead**.

And from here, the evidence stage begins.

Practically, this was the stage I learned the most from — because it became clear that the difference is made less by the content of the evidence than by **how you send it and what record you keep**.`,
  sections: [
    {
      title: 'Do not let the notice end at "it arrived"',
      subtitle: "Write out every deadline in it",
      body: `The tribunal's notice pulls together some very important information.

- the case number
- the deadline for the respondent's response (ET3)
- what happens if no response is filed
- **the date and format of the hearing**
- **the claimant's deadline for producing evidence**
- **the respondent's deadline for producing evidence**
- the deadline for sending documents to the tribunal
- the rule about copying the other side when you contact the tribunal

What I did was **write all of it into a calendar** the moment it arrived.

The thing to watch particularly is that there are **several different kinds of deadline**.

**The deadline for sending to the other side and the deadline for sending to the tribunal are not the same.**

In my case there was a separate requirement to send the tribunal the full set of documents **no later than seven days before** the hearing. If you send everything to the respondent and relax, you miss it.

One more thing. When you contact the tribunal, the rule is to **copy in the respondent**. Do not write to one side only — it can be read as approaching the tribunal behind the other party's back.`,
    },
    {
      title: "Structure the bundle and index it",
      subtitle: "The eight items I actually submitted",
      body: `Rather than throwing loose files at it, I organised the evidence as **a single set with an index**.

What I actually submitted was:

| # | Document | Purpose |
|---|---|---|
| 1 | Schedule of loss | The spine of the claim: what was calculated and how |
| 2 | Service charge shortfall calculation | Daily figures and the working |
| 3 | Days actually worked | The basis for how many days were worked during employment |
| 4 | Payslips | The service charge actually paid to me |
| 5 | Front-of-house rotas | How many people worked each day |
| 6 | Kitchen rotas | Same |
| 7 | Witness statement 1 | Corroboration from a colleague |
| 8 | Witness statement 2 | Same |

Alongside these I also produced the POS daily sales reports (Z reports) and a menu showing the service charge.

What I was conscious of throughout was that **all of it is the company's own business records**.

The only things I created were the calculations in items 1 and 2, and every number in those calculations comes from documents the company produced in the ordinary course of business. No guesswork, no after-the-fact reconstruction.

That goes directly to the strength of the claim. If the other side wants to dispute the figures, **they have to dispute their own records**.

On the witness statements, I was careful not to put pressure on the people who helped. If you are going to involve someone, think first about whether it exposes them to risk.`,
    },
    {
      title: "There is a trap in how you send large files",
      subtitle: "The dispute was about link expiry",
      body: `Practically, I think this is the easiest thing to get caught by.

The full set of evidence included scans of rotas and Z reports, so it came to **tens of megabytes**. Too large to email as attachments.

So I used a large-file transfer service and sent a link. I sent it within the deadline, in accordance with the tribunal's directions.

The problem was that **the link had an expiry date**.

**About two months after** I sent it, the respondent got in touch:

> I must say I am unable to complete a submission at present because the links to the documents you sent have expired. Please can you re-send the documents?

In other words: accessible at the point it was sent, expired by the point they actually tried to open it.

Then, **about two weeks later**, another email from the same person:

> I believe it's possible that my business partner […] may have clicked on the links back in October but she did not download any documents. So I do not have access to them.
>
> Are you saying that you're unwilling to send / make available these documents again?

Two things can be read out of those two emails.

- **It is not denied that the links were opened.** The account is that they were opened but nothing was saved. So service itself is not actually in dispute
- **The date the respondent gives moves between the first email and the second.** That is dealt with in the next section

**The lessons here are clear.**

- Send large files by a method with **a long expiry**, or **no expiry**
- **Record the link's expiry date** at the point you send it
- Always keep **a record** of the fact of sending, the date and time, and the recipient
- If you can, split the PDFs and **also send them as email attachments**

Whether you can prove service always becomes an issue later. "I'm sure I sent it" is not enough.`,
    },
    {
      title: 'How to answer "we never received it"',
      subtitle: "Correct the date. Re-send, but do not move the deadline",
      body: `How you handle this moment may be the single most useful part of this account.

The respondent's email opened like this:

> I refer to your email dated 11 November 2025 to […].

**That date was wrong.** I did not send an email that day. The actual date was different, and it complied with the tribunal's directions. And in the next email, the same person writes that they "may have clicked on the links back in October". **The dates move within the respondent's own account.**

It may look like a small point. In practice, letting it go costs you later.

**If you reply without correcting it, you have accepted that date as the premise.**

The correspondence is later put before the tribunal as evidence. If the other side drafts submissions on the footing that "the claimant says she sent it on 11 November", that footing is then supported by **the record sitting in both parties' emails**. If the date of sending shifts, so can the assessment of whether service was in time.

Dates and facts the other side puts to you **may have been interpreted in the way that suits them**. Reply as though they are agreed and that becomes the record.

So I **checked the facts first** and corrected the date at the top of my reply. Not as an emotional pushback, but as **a correction to the record**.

- state the fact that nothing was sent on the date they gave
- state the actual date, time, and recipient
- then move on to the substance

For the same reason, I did not take the bait in the second email's framing — "are you saying you're unwilling". **At that point I had neither refused nor agreed.** A question that carries a premise has to be answered by addressing the premise.

Then I responded along these lines:

> The documents were properly served within the deadline, in accordance with the tribunal's directions, and were accessible at that time.
>
> That said, **as a matter of courtesy**, I am re-sending the same documents.
>
> For the avoidance of doubt, **this re-sending does not constitute fresh service and does not reset, vary, or extend any procedural deadlines or applicable time limits.**

**That last sentence is the important one.**

Here is why. The respondent's deadline for responding runs from the original service. Re-send without saying anything and there is room to argue that the re-send is fresh service and **the respondent's deadline has therefore been extended**.

There is nothing wrong with agreeing to re-send. Being seen as uncooperative is the worse outcome.

What matters is making explicit that **you are cooperating without giving up your procedural position**.

The same thinking applies elsewhere. When you accommodate a request, and it does not amount to waiving a right or resetting a clock, say so in writing.`,
    },
    {
      title: "Do not get pulled into an emotional exchange",
      subtitle: "Answer with facts only",
      body: `The correspondence also contained material that had nothing to do with the procedure.

That the relationship had been a good one. Personal disappointment. Remarks about my attitude and character. There was also a comment touching on nationality.

Here is some of it verbatim.

> I'm quite insulted that you were so polite and pleasant to my face, yet have proceeded to attempt to claim a large sum of money from my company - in effect, from me - after leaving. I wonder if you would treat a Japanese employer this way, or would you be more respectful?

> Maybe you think that we are a soft target because of this. I really hope not, because as an employer we will not tolerate being taken advantage of.

> I was really hoping for a more constructive attitude from you, I'm so disappointed on a personal level by your conduct since leaving Tenshi. You never really know what someone's like, do you?

When this arrives, you want to answer it.

**You do not need to.**

What I replied to was the correction of fact and what the procedure required. Nothing else.

Three reasons.

1. **The tribunal decides the substance of the claim**, not who behaved more pleasantly
2. The correspondence **may later be read by the tribunal**. The calmer party gains
3. Trading emotional replies **burns time and energy**. This is a long game

Short, polite, facts only. That is enough.

> This may look like restraint. It is actually tactics.
> Staying composed in correspondence that becomes part of the record is itself part of your case.`,
    },
    {
      title: "The respondent's argument, and how I answered it",
      subtitle: '"It need not be shared equally" is, in fact, correct',
      body: `The respondent did also make a substantive argument. In fairness, here it is.

In substance:

> The law says an employer may not retain the service charge and must allocate it to staff, but **it does not say it must be allocated equally**. And in fact it is not equal.
>
> Staff understand that the proportion they receive varies with factors such as **length of service, skill, service performance, how often they are rostered, and hours worked**.
>
> So dividing the total by the number of staff to arrive at your share produces a result that is neither accurate nor appropriate.

**The first part of that is a correct statement of the law.**

As set out in an earlier chapter, the Tipping Act requires fair and transparent allocation, but "fair" does not mean "the same for everyone". Weighted allocation is lawful.

So how did I answer it?

**The issue is not whether weighted allocation is permitted. It is whether a weighted allocation rule actually existed at this workplace.**

My case was:

- throughout my employment, there was **no explanation of the allocation method, written or verbal**
- the service charge was **pooled and handled as a lump**, not managed or allocated per individual
- there was **no documented scheme** for allocation by role, performance, or weighting
- the payslip showed only **a single total figure**, with no breakdown and no basis for the calculation
- it was not an environment in which employees could freely ask how allocation worked, and no opportunity to obtain an explanation was given

On that basis, I put it this way:

**In the absence of any documented allocation rule or identifiable method of calculation, treating the charge as accruing equally to everyone who worked that day is the approach most consistent with how it was operated in practice and with the evidence that actually exists.**

Put another way:

> If the assertion is that a weighted allocation rule existed, **it is for the party that was under a duty to create that rule and keep the records to produce it**.
>
> If there is nothing to produce, the only option left is to calculate by a method that can be verified from the records.

That is why the absence of documentation **does not necessarily work against the claimant**.

There is one more thing worth noting here. The respondent did not put this argument to the tribunal. They only stated it in emails to me.

**An argument is not treated as an argument unless it is put in a form that reaches the tribunal.** The next chapter is about exactly that consequence.`,
    },
  ],
};
