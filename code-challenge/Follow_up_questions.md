# Coding Challenge — Follow-up Questions

Answers are in my own words, lightly tidied from voice dictation. The prompts in question 4 are listed in the order I gave them, lightly tidied from voice dictation too.

**Tool:** Claude Code (Fable 5.1). The resulting app is in `calculator/`; its design pages are in `calculator/docs/`, starting from `system-shape.md`.

---

## 1. How far were you able to get with the exercise?

I think for the outcomes, I got most of them: the frontend, the backend that does the calculations, tests on both sides, CI and a one-command Docker run.

But there is a step I usually do when coding with AI assistance that I did not finish here. I usually read almost all the code it generates and investigate it, to make sure every step the AI takes is valid. In this application I only read about a sixth of the code. I count that as the distance left before I would call the exercise finished.

## 2. What challenges did you encounter in the process?

- **Keeping the system design under my awareness.** At the first step, when I designed this system, I expected the AI to output very wordy design documents. So I limited the length of each design file to no more than 200 words, except the diagram file. That is easier for me to keep track of the overall system design, instead of letting the AI lead the system design without my awareness.

## 3. If you were given unlimited time, what additional functionality would you include?

- User data analysis: if users approve, collect their usage data and analyze which functions I should add based on their behavior.
- I would inspect the user story first: who will use it, in which background, and analyze what kind of features they would want. If they are very math-heavy, I would add more operators.
- Test the user path more, and optimize the code so it feels snappier, down to the millisecond level.
- A history, with a database to store all the calculations they did.
- The keyboard instruction area still feels a bit off; I would make it better looking.

## 4. If you used AI, please include all of your prompts and answer the following questions

### Prompts

1. Now I am going to complete this challenge: *"Build a calculator web application. It should include a frontend piece and any backend logic needed to perform the calculations."* For now, only focus on the high-level design, top to bottom, step by step.

2. Let's put all the design into the Level 1 system shape diagram as much as possible, and add internal links in the diagram to link to the details. For this first-season design part, put all the documents inside a folder: `~/Developer/ns_interview/code-challenge/calculator/docs`. The system shape diagram should be the starting point of the overall system design; all other design docs should branch out from it. Make sure the first version of each doc file contains less than 200 words each, except the diagram file.

3. Yes, please start to build it.

4. *(/fork)* Wire up the front end as soon as possible and open it for me to test it, to optimize the IxD. You wire up the backend and testing while I test it.

   From here the work split into two branches:

   > **Branch A: backend and testing.** The AI wired the API, the tests, CI and Docker on its own; no further prompts were needed.

   > **Branch B: UI and interaction design.** I tested the running app by hand and gave these prompts:
   >
   > - **4.1** Issue: the multiply sign displays as `*`.
   > - **4.2** The instruction texts are crammed together.
   > - **4.3** Use the palette as 60% dark, 30% grey and 10% yellow.
   > - **4.4** How about making the background outside the calculator, the canvas of the browser, not dark, but making the background of the calculator completely dark, and organizing the buttons with yellow and grey?
   > - **4.5** I'll replace the yellow with orange.
   > - **4.6** Make the background not white, that's too much contrast. Make it like grey or blue, or dark blue or dark grey.
   > - **4.7** Make the font larger.
   > - **4.8** Make the number in the display, in the calculation line, larger.
   > - **4.9** More larger, and less space between the calculation line and the buttons.
   > - **4.10** *(with a screenshot)* In this picture there are too many lines of output for the decimals. Please make sure the total result display is just one line, not two lines, not three lines, by setting a digit length limit.
   > - **4.11** When I finish a calculation, the full operands and the result are over there, and when I continue the calculation by pressing an operator, the issue is the result number gets larger. I don't want that; I want the result number to keep its size.
   > - **4.12** When I type the operands and operators and click equals, if the number is a bit longer, it shows a very short flash before the result comes out. Why?

5. let's talk about what we should put into the README.

6. Only keep the top five sections.

### What did the AI do well?

It did very well at the backend design; that is where most of its training data lands. It also did very well at verbose, wordy write-ups and code, and it was very good at restructuring my garbled wording when I used voice input.

### What did the AI do poorly?

Aesthetics and interaction design. So letting it branch out to display the UI as quickly as possible, and letting me keep optimizing it, was crucial.

It also usually does not test how much time, CPU, GPU or storage space things cost. It did not really test that here either. That is something I should do myself afterwards.

The design docs drift, all factual. The parts that drift most easily should be generated deterministically, by the CLIs or some other tool, straight from the current facts.

### For the places it did poorly, how did you change your approach to your prompts to improve its output?

 I think I could change my prompts to focus more on high-level design at the front, including the palette. I forgot to include the palette in the system design in advance, so I only edited it later, one issue at a time. The one adjustment I did make up front: at the first step, when I designed this system, I expected it to output very wordy design documents, so I limited the length of each file to no more than 200 words. That kept the overall system design something I could keep track of, instead of letting the AI lead it without my awareness.
