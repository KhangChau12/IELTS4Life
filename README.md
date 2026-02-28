# IELTS Writing Assistant

An AI-powered platform designed to help students improve their IELTS Writing Task 2 performance through intelligent feedback, vocabulary enhancement, and structured practice tools.

## Demo Video

[![IELTS Writing Assistant Demo](https://img.youtube.com/vi/kqPYIquPSsU/maxresdefault.jpg)](https://www.youtube.com/watch?v=kqPYIquPSsU&t=3s)

## Overview

IELTS Writing Assistant provides instant, detailed feedback on IELTS Task 2 essays using advanced AI technology. The platform offers comprehensive scoring across all four IELTS assessment criteria, personalized vocabulary building tools, and interactive learning features to accelerate your writing improvement.

## Core Features

### Essay Assessment and Feedback

**AI-Powered Band Scoring**
- Instant band scores (0-9 scale) for all four IELTS criteria: Task Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy
- Overall band score calculated according to official IELTS standards

**Detailed Performance Analysis**
- Strengths identification with highlighted examples and specific error detection with explanations
- Color-coded scoring badges and actionable improvement suggestions for each criterion

**Essay Improvement Tool**
- AI-generated improved version with interactive highlighting showing original text, improvements, and explanations

### Progress Tracking

**Comprehensive Dashboard**
- Visual charts tracking score progression and comparison across all four IELTS criteria over time

**Performance Analytics**
- Average band score, total essay count, and best/worst performing criteria identification

**Error Pattern Recognition**
- AI-powered summary analysis identifying recurring mistakes with personalized improvement recommendations

### Vocabulary Development

**Paraphrase Vocabulary Generation**
- Identifies approximately 10 basic words in your essay and suggests C1-C2 level alternatives with contextual definitions

**Topic-Specific Vocabulary**
- Generates approximately 10 advanced vocabulary items and collocations tailored to your essay topic

**Vocabulary Management**
- Organized storage with categorization, view status tracking, and quiz performance indicators

### Interactive Learning Tools

**Flashcard System**
- Digital flashcards with spaced repetition algorithm supporting multiple study modes (paraphrase only, topic only, or mixed)

**Vocabulary Quizzes**
- Multiple-choice and fill-in-the-blank formats with immediate feedback and detailed results
- Customizable quiz scope with score tracking and performance breakdown by vocabulary type

**Quiz Performance Tracking**
- Historical record with best scores and performance trends over time

### Writing Prompts Library

**Prompt Bank by Topic and Question Type**
- A curated bank of IELTS Task 2 prompts organized by topic and question type, covering all 7 formats: Agree/Disagree, Advantages & Disadvantages, Cause & Solution, Two-part Question, Positive & Negative, Discussion (Both Views), and Mixed/Hybrid
- Filter prompts by topic or question type, with personal best score displayed for each attempted prompt

**AI Outline Suggestions**
- Each prompt offers two AI-generated outline options to help plan essay structure before writing

**Timed Writing Session**
- Automatic timer starts when you begin writing from any prompt
- Essay drafts are auto-saved so work is never lost when leaving mid-session

### Essay History

**Complete Submission Archive**
- Chronological list with prompt preview, submission date, word count, band scores, and quick-access links

### Notification Center

**Platform Announcements**
- Receive announcements from the platform about updates, new features, and important information
- Notifications are targeted by audience group (all users, pro, or free tier)
- Read status tracked per notification

### User Accounts and Quotas

**Free Tier Access**
- 3 essays per day, 6 total base quota with additional essays earned through referrals
- Full access to all feedback, vocabulary tools, flashcards, and quizzes

**Pro Tier Benefits** (Coming Soon)
- 5 essays per day with unlimited total quota at approximately $3/month
- Automatic Pro access for PTNK school students

**Quota Tracking**
- Visual charts showing usage versus limits with real-time updates

### Referral System

**Invite Friends Program**
- Unique invite code with one-click sharing earning both referrer and new user 6 additional essays each
- Referral statistics dashboard with invitation history

### Guest Access

**Trial Without Registration**
- Single free essay submission with full AI scoring and feedback using device-based tracking

### School Integration

**PTNK Special Access**
- Automatic Pro tier with unlimited essays for @ptnk.edu.vn email addresses at no cost

## Role System

The platform uses a three-tier role hierarchy:

- **Student** (default): Standard user with access to all learning features — essay submission, vocabulary tools, flashcards, quizzes, and progress tracking
- **Admin**: Appointed by the developer to maintain and update the platform — can add, edit, and delete writing prompts and topics, and view platform statistics
- **Dev**: Full access — all admin capabilities plus the ability to send broadcast notifications to users

## Administrative Features

**Platform Analytics Dashboard**
- User growth trends, essay submission statistics, and score distributions across all users
- AI API token usage tracking with cost estimation
- Vocabulary and quiz statistics including total items generated, quiz accuracy rates, and attempt history
- Referral program metrics and writing prompts adoption statistics

**Writing Prompts Management**
- Add, edit, and delete prompts and topics directly from the admin interface
- Generate AI outlines for any prompt from the admin panel
- Organize prompts by topic and question type

**Resource Monitoring**
- AI API token usage tracking with cost estimation and performance metrics

**User Management**
- User directory with registration dates, role, and essay count
- Role assignment and user overview

**Notifications Broadcast** (Dev only)
- Send announcements to all users or target specific groups (all / students / pro / free tier)
- Manage, edit, and delete notifications from the admin panel
- This feature is restricted to the developer role and is not available to regular admins

## Security and Performance

**Rate Limiting**
- Request throttling with automatic abuse detection and fair usage enforcement

**Data Protection**
- Secure authentication with encrypted password storage and role-based API access

## Getting Started

### For Students

1. Create an account or try the platform with one free guest essay
2. Submit your IELTS Writing Task 2 essay with the complete prompt, or browse the writing prompts library and filter by topic or question type, view AI-generated outlines, and practice with the built-in timer
3. Receive instant AI-powered band scores and detailed feedback
4. Review strengths and areas for improvement across all four criteria
5. Generate vocabulary suggestions from your essay
6. Practice with flashcards and quizzes to reinforce learning
7. Track your progress over time through the dashboard
8. Invite friends to earn additional essay submissions

### For PTNK Students

1. Register using your @ptnk.edu.vn email address
2. Enjoy automatic Pro tier access with unlimited essays
3. Access all platform features without subscription fees


## Technical Information

**Built With**
- Next.js 14, TypeScript, Tailwind CSS
- Supabase (PostgreSQL database and authentication)
- Groq API (Llama 3.3 70B model for essay scoring)
- OpenAI API (GPT-4o for vocabulary generation and error summaries)

## Support and Documentation

For questions, issues, or feature requests, please refer to the documentation included in this repository or send an email to phuckhangtdn@gmail.com

---

**IELTS Writing Assistant** - Intelligent feedback for serious learners
