# 🌙 Luna Sentinel
**Privacy-First Threat Interception for Teen Safety — Without Surveillance**

## The Problem
Traditional parental safety apps read every message, photo, and keystroke — 
destroying the trust between parent and child to deliver "safety." We asked:
what if a child could be protected from predators, scams, and self-harm risk
without a single word of their conversation ever being stored or read by anyone,
human or AI in the cloud?

## Our Approach: Zero-Knowledge Threat Detection
Luna Sentinel analyzes messages in real time and immediately discards the raw
text. Only an abstract risk signal — category, confidence, and a behavioral
guidance plan for the parent — survives. The parent never sees the chat. They
see what to do about it.

## A Deliberate Architecture Decision
Our original design routed inference through Amazon Bedrock (Claude 3 Haiku)
via API Gateway and Lambda. During this hackathon, our new AWS account's
Bedrock model access request was still pending manual approval at submission
time — a known onboarding delay for new accounts, outside our control.

Rather than block on that, we shipped with **on-device inference (Llama 3.2
via Ollama)** for this build. This is not just a fallback — it's arguably a
*stronger* privacy guarantee than our original plan: it means chat text never
leaves the device, not even to trusted cloud infrastructure. Our production
roadmap uses this local model as a first-pass filter, escalating only
already-anonymized risk signals to Bedrock for deeper reasoning — combining
on-device privacy with cloud-scale intelligence.

## AWS Usage
- **Frontend Hosting:** AWS Amplify (live at: [your URL])
- **Planned/architected:** API Gateway → Lambda → Amazon Bedrock (Claude 3
  Haiku) → DynamoDB, blocked on model access approval this weekend — full
  architecture diagram in-app under the "Architecture" tab.

## Tech Stack
React, Vite, Tailwind, Ollama (Llama 3.2 3B), AWS Amplify

## Try It
[live URL] — use the Simulation Panel to trigger sample threat scenarios
(grooming, self-harm, phishing) without needing real data.
