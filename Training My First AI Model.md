---
title: Training my first AI Model 🤖
created: 2023-06-07T09:58:02+05:30
updated: 2023-11-11T12:30:14+05:30
---

Let me take you on a journey through training of an AI model.

# Problem Statement

I am building [[Conversation Copilot]], one of the features I am targeting in v1 is tracking of followup on a message.

At times, you need to follow up on messages, let's say I had a conversation with my manager.

> Rhitik: Summer is coming, can we install a water cooler installed at the premises?
>
>
> Roshan:  Let me check with some vendors and get back to you.
> *crickets* end of the day passes
>
>
> 🦗 *crickets* 🦗 
>
>
> summer arrives
>
>
> Rhitik: Hey Rosh, do we have any update on the water cooler conversation?
>
>
> Roshan: Oh shucks totally forgot about it. Let me check and get back to you in sometime.
>
>
> *Copilot (to Roshan after a few hours): Hey Roshan, you need to follow up with Rhitik and share him the vendors for water cooler installation. It would be a good idea to update him about the same.*

I am training a model to understand what messages requires followups.

As the title suggests this is my first dig at training a model. I don't have very high expectations. But journey of thousand miles begins with a single step.

**This is my first step!**

What we will be doing?

1. Figure out a data source.
2. Bring in the data.
3. Clean up data and prepare for training.
4. Train model.
5. Evaluate.
6. Loop back to 3 if we are not getting above 90% accuracy


## Step 1: Figuring out data source

What kind of data I want?

**Criteria for data**
1. Concise conversations - I don't want to train the model on emails. Because my end goal is to use it on slack data.
2. Non-automated - I don't want conversations with chatbots.
3. Multi-user - I want multiple users to be part of the data.
4. Threaded - What is being replied to should be apparent from data.

