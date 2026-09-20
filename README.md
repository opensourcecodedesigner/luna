# 🌙 Luna Sentinel
**Privacy-First Threat Interception for Teen Safety — Without Surveillance**

## The Problem
Traditional parental safety apps read every message, photo, and keystroke — destroying the trust between parent and child to deliver "safety." We asked: what if a child could be protected from predators, scams, and self-harm risk without a single word of their conversation ever being stored or read by anyone, human or AI in the cloud?

## Our Approach: Zero-Knowledge Threat Detection
Luna Sentinel analyzes messages in real time and immediately discards the raw text. Only an abstract risk signal — category, confidence, and a behavioral guidance plan for the parent — survives. The parent never sees the chat. They see what to do about it.

## A Deliberate Architecture Decision
Our original design routed inference through Amazon Bedrock (Claude 3 Haiku) via API Gateway and Lambda. During this hackathon, our new AWS account's Bedrock model access request was still pending manual approval at submission time — a known onboarding delay for new accounts, outside our control.

Rather than block on that, we shipped with **on-device edge inference (Llama 3.2 via Ollama)** alongside a **Seamless In-Browser Fallback Engine** for our live web build. This is not just a fallback — it's arguably a *stronger* privacy guarantee than our original plan: it means chat text never leaves the device, not even to trusted cloud infrastructure. Our production roadmap uses this local edge model as a first-pass filter, escalating only already-anonymized risk signals to Bedrock for deeper reasoning — combining on-device privacy with cloud-scale intelligence.

## AWS Usage (WeMakeDevs "Ship It" Track)
- **Frontend Hosting:** AWS Amplify (Live at: https://main.dmjfl1obi6jb6.amplifyapp.com)
- **Planned/architected:** API Gateway → Lambda → Amazon Bedrock (Claude 3 Haiku) → DynamoDB, blocked on model access approval this weekend — full architecture diagram in-app under the "Architecture" tab.

## Tech Stack
React, Vite, Tailwind CSS, Ollama (Llama 3.2 3B Edge-AI), AWS Amplify

## Try It Live
**Access the live build:** https://main.dmjfl1obi6jb6.amplifyapp.com

Use the **Live Interception Tester** at the bottom of the Kid Hub to trigger dynamic threat scenarios without needing real chat data:
1. Type `"give me money"` to intercept a Financial Phishing attempt.
2. Type `"don't tell your parents"` to intercept a Predatory Grooming pattern.
3. Watch the UI autonomously redirect to the Parent Hub, delivering the isolated risk token without exposing the raw chat log.
