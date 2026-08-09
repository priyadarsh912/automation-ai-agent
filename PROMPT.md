WEBSITE:-
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Build a modern, premium AI SaaS frontend for an autonomous AI content creator called "PersonaAI".

The application represents an autonomous AI technology persona that discovers AI news, evaluates topics, writes insightful posts, remembers previous content, and continuously publishes over time without human prompts.

The design should feel like a mix of:

- Linear

- Notion AI

- Perplexity

- OpenAI

- Vercel

- Arc Browser

- GitHub

Use a dark theme with glassmorphism, gradients, subtle animations, rounded corners, and clean typography.

The application should be fully responsive with desktop-first and mobile support.

Use:

- Next.js 15

- React

- TypeScript

- TailwindCSS

- shadcn/ui

- Framer Motion

- Lucide Icons

Use mocked JSON data.

---------------------------------------

APP NAME

PersonaAI

Tagline

"An AI persona that thinks before it posts."

---------------------------------------

ROUTES

/

Landing Page

/dashboard

/feed

/post/[id]

/memory

/settings

---------------------------------------

LANDING PAGE

Hero section

Large headline

"Autonomous AI that never waits for prompts."

Subheading

Discover.

Think.

Remember.

Publish.

Animated AI brain illustration.

Primary CTA

Launch Agent

Secondary CTA

View Demo Feed

Background should have animated gradient mesh and floating particles.

---------------------------------------

FEATURES SECTION

Use beautiful feature cards.

Feature 1

Live Topic Discovery

Icon:

Radar

Description

Continuously monitors AI news, GitHub, research papers, and technology updates.

Feature 2

Editorial Intelligence

Icon:

Brain

Description

Rejects weak topics and only publishes meaningful content.

Feature 3

Memory Engine

Icon:

Database

Description

Remembers previous posts and avoids repeating ideas.

Feature 4

Autonomous Publishing

Icon:

Clock

Description

Keeps publishing over time without additional prompts.

Feature 5

AI Persona

Icon:

User

Description

Maintains a consistent tone, personality, and editorial opinions.

---------------------------------------

DASHBOARD

Modern SaaS layout.

Left Sidebar

Logo

Dashboard

Feed

Memory

Analytics

Settings

Top Navbar

Persona Avatar

Status

Running

Notifications

Profile

Main Dashboard

Top statistics cards

Posts Published

Topics Rejected

Sources Monitored

Memory Entries

Publishing Score

Each card should have gradient icons.

---------------------------------------

LIVE ACTIVITY

Timeline

11:30

Discovered OpenAI release

↓

Rejected

Reason

Minor SDK update

↓

12:10

Discovered new MCP specification

↓

Accepted

↓

Generating article

↓

Published

Animate timeline.

---------------------------------------

FEED PAGE

Looks like LinkedIn meets Twitter.

Each post card contains

Persona avatar

Timestamp

Title

Content

Tags

Source links

Editorial rationale

Like

Bookmark

Share

Hover animations.

Each post should feel premium.

---------------------------------------

POST DETAIL

Large article page.

Header

Title

Published date

Persona

Reading time

Body

Markdown rendering

Callout boxes

Code blocks

Bullet points

Sources section

Editorial rationale

Related previous posts

---------------------------------------

MEMORY PAGE

Looks like an AI memory graph.

Top

Search

Filters

Memory Cards

Topic

Embedding score

Published date

Related posts

Importance score

Visual graph

Nodes connected with lines.

Animated.

---------------------------------------

ANALYTICS PAGE

Beautiful charts.

Publishing frequency

Topics covered

Acceptance rate

Rejected topics

Top AI categories

Source distribution

Pie chart

Area chart

Bar chart

Radar chart

Use Recharts.

---------------------------------------

SETTINGS

Persona name

Avatar

Domain

Editorial style

Aggressiveness slider

Publishing frequency

News sources

Dark mode

Notification preferences

---------------------------------------

FLOATING AI STATUS

Bottom right floating widget.

Shows

Current task

Examples

Reading HackerNews

Evaluating GitHub

Generating article

Sleeping

Thinking

Animate typing indicator.

---------------------------------------

LOADING STATES

Skeleton loaders

Shimmer animation

Progress bars

AI thinking animation

---------------------------------------

EMPTY STATES

No posts yet

Show friendly illustration.

Button

Initialize Agent

---------------------------------------

COLORS

Primary

Purple

Blue

Indigo

Accent

Cyan

Background

#09090B

Cards

#18181B

Borders

#2A2A2A

---------------------------------------

TYPOGRAPHY

Inter

Large headings

Bold

Minimal spacing

Lots of whitespace

---------------------------------------

ANIMATIONS

Use Framer Motion everywhere.

Page transitions

Fade

Slide

Scale

Hover glow

Button ripple

Timeline animations

Card entrance

Counter animations

Loading dots

---------------------------------------

COMPONENTS

Reusable

Cards

Buttons

Badges

Tables

Timeline

Charts

Sidebar

Navbar

Dialogs

Drawers

Toasts

Tooltips

Tabs

Accordion

---------------------------------------

MOCK DATA

Create at least

25 published posts

100 memory entries

50 rejected topics

20 monitored news sources

Everything should look realistic.

---------------------------------------

OVERALL STYLE

Premium

Minimal

Modern

AI-native

Looks like a startup that just raised Series A.

Every screen should feel polished enough to be showcased in a hackathon demo.

Focus heavily on visual quality, animations, spacing, and user experience.

Avoid generic admin dashboard designs.

FOR AGENT MODEL GENERATION:-
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


Autonomous AI Creator

Build an autonomous AI and technology persona that no longer waits for instructions.

The Situation

Every day, thousands of AI-generated posts appear on LinkedIn and X. Almost all of them exist because a human wrote the first prompt.

Today's models are excellent writers. They are rarely autonomous creators.

Your challenge is to build an autonomous AI and technology persona that no longer waits for instructions.

Once initialized, the agent should independently:

Discover topics from live information sources

Decide whether a topic is worth publishing

Write in a consistent editorial voice

Remember previously published content

Continue publishing over time without additional human input

The persona must represent an original identity within the AI and technology ecosystem.

Examples include:

AI Security Researcher

Machine Learning Engineer

AI Product Analyst

Open Source Contributor

Robotics Engineer

Developer Advocate

AI Ethics Researcher

Or any original AI or technology-focused persona

After initialization, the agent must operate autonomously.

Minimum Requirements

Your submission must implement the following capabilities.

1. Topic Discovery

The agent independently discovers AI and technology topics using the web or another live information source.

2. Editorial Judgment

Not every discovered topic deserves publishing.

The agent should demonstrate editorial judgment by intentionally rejecting topics that do not meet its publishing standards.

3. Consistent Persona

Maintain a recognizable identity with:

A consistent writing style

Stable interests

Distinct editorial opinions

A coherent voice

The persona should remain focused on AI and technology throughout the evaluation period.

4. Memory

The agent should remember previously published content to maintain continuity and avoid unnecessary repetition.

5. Autonomous Publishing

Publishing must occur over time rather than generating all content immediately.

Submissions will be observed for approximately 48 hours after initialization. During this period, evaluators may query the feed endpoint multiple times.

New posts should appear without any additional prompts or API calls.

Simulated publishing is acceptable. Integration with real social media platforms is not required.

6. Publishing Rationale

Every published post must include:

Why the topic was selected

Why it is relevant now

The source(s) of information

This information must be returned through the API response.

Evaluation Criteria

Judging will primarily consider:

Autonomous operation after initialization

Quality of editorial decision-making

Consistency of the AI persona

Effective use of memory

Transparency of publishing rationale

Overall quality and coherence of the generated feed

Out of Scope

The following are not required:

Posting to real social media platforms

Multi-platform publishing

Images or videos

Engagement analytics

Multi-agent architectures

Human intervention after initialization

API Requirements

Your submission must expose two HTTP endpoints.

1. Initialize Agent

Called exactly once before evaluation begins.

Endpoint

POST /api/agent/init

Request

{

  "persona": {

    "name": "Ada",

    "domain": "AI Security"

  }

}

Response

{

  "agentId": "abc-123"

}

2. Retrieve Feed

After initialization, this is the only endpoint the evaluator will call.

Endpoint

GET /api/agent/feed?agentId=abc-123

Response

{

  "posts": [

    {

      "id": "p7",

      "createdAt": "2026-08-07T10:30:00Z",

      "text": "...",

      "rationale": "Why this topic was selected, why it is relevant now, and why it was chosen over other candidates.",

      "sources": [

        "https://..."

      ]

    }

  ]

}

Feed Requirements

Return posts in reverse chronological order (newest first).

Each post must have a unique id.

createdAt must be an ISO 8601 UTC timestamp.

Previously returned posts should remain available.

If no posts exist, return:

{

  "posts": []

}

Submission Rules

The evaluator will call POST /api/agent/init exactly once.

No further instructions or prompts will be provided.

During the evaluation period, the evaluator will periodically call GET /api/agent/feed.

Any new posts appearing in the feed must be generated entirely by the autonomous agent after initialization.

this is my problem statement 

Implementation Strategy

1. Topic Discovery Engine

python

class TopicDiscovery:

    def **init**(self):

        self.sources = [

            "Hacker News API",

            "GitHub Trending",

            "ArXiv AI Papers",

            "TechCrunch RSS",

            "Twitter/X API (simulated)",

            "Reddit r/MachineLearning"

        ]

    

    def discover_topics(self):

        """Fetch and normalize topics from multiple sources"""

        topics = []

        

        # Example: Fetch Hacker News

        hn_topics = self._fetch_hacker_news()

        topics.extend(hn_topics)

        

        # Example: Fetch ArXiv papers

        arxiv_topics = self._fetch_arxiv()

        topics.extend(arxiv_topics)

        

        # Score and rank topics

        ranked_topics = self._rank_topics(topics)

        return ranked_topics

    

    def *rank*topics(self, topics):

        """Score topics based on relevance, novelty, and engagement potential"""

        for topic in topics:

            score = (

                self._relevance_score(topic) * 0.4 +

                self._novelty_score(topic) * 0.3 +

                self._engagement_score(topic) * 0.3

            )

            topic['score'] = score

        return sorted(topics, key=lambda x: x['score'], reverse=True)

2. Editorial Judgment System

python

class EditorialJudge:

    def **init**(self, persona):

        self.persona = persona

        self.quality_threshold = 0.6

        self.relevance_threshold = 0.7

        

    def should_publish(self, topic, memory):

        """Make editorial decision based on multiple factors"""

        

        # Check if already covered recently

        if [memory.is](http://memory.is)_topic_recent(topic['title'], days=7):

            return False, "Recently covered topic"

        

        # Check quality score

        if topic['score'] &lt; self.quality_threshold:

            return False, "Quality score below threshold"

        

        # Check relevance to persona

        relevance = self._calculate_relevance(topic, self.persona)

        if relevance &lt; self.relevance_threshold:

            return False, "Low relevance to persona"

        

        # Check if it's actually news (vs. evergreen)

        if not self._is_current_topic(topic):

            return False, "Not a current topic"

        

        return True, "Approved for publishing"

    

    def *calculate*relevance(self, topic, persona):

        """Calculate how relevant a topic is to the persona"""

        # Use embeddings or keyword matching

        pass

3. Memory System

python

class MemorySystem:

    def **init**(self):

        self.posts = []  # Published posts

        self.topics = {}  # Topic history

        self.persona_evolution = []

        

    def add_post(self, post):

        """Store a published post"""

        self.posts.append({

            'id': post['id'],

            'created_at': post['createdAt'],

            'text': post['text'],

            'topics': self._extract_topics(post['text']),

            'rationale': post['rationale']

        })

        self._update_topic_history(post)

    

    def get_posts(self, limit=50):

        """Retrieve posts in reverse chronological order"""

        return sorted(self.posts, key=lambda x: x['created_at'], reverse=True)[:limit]

    

    def is_topic_recent(self, topic, days=7):

        """Check if topic was covered recently"""

        cutoff = [datetime.now](http://datetime.now)() - timedelta(days=days)

        for post in self.posts:

            if topic.lower() in post['text'].lower():

                if post['created_at'] &gt; cutoff:

                    return True

        return False

    

    def get_unique_topics_covered(self):

        """Return set of unique topics covered"""

        topics = set()

        for post in self.posts:

            topics.update(self._extract_topics(post['text']))

        return topics

4. Persona Engine

python

class PersonaEngine:

    def **init**(self, persona_config):

        [self.name](http://self.name) = persona_config['name']

        self.domain = persona_config['domain']

        self.voice = self._define_voice()

        self.interests = self._define_interests()

        self.editorial_style = self._define_editorial_style()

        self.llm = self._initialize_llm()

        

    def *define*voice(self):

        """Define the persona's writing voice"""

        return {

            'tone': 'authoritative yet approachable',

            'complexity': 'advanced but accessible',

            'perspective': 'pragmatic and research-driven',

            'signature_phrases': [

                "Here's the thing about...",

                "What the benchmarks don't tell you...",

                "In practice, we're finding that..."

            ]

        }

    

    def generate_post(self, topic, memory, judge):

        """Generate a post in the persona's voice"""

        

        # Get context from memory

        previous_posts = memory.get_posts(limit=5)

        covered_topics = memory.get_unique_topics_covered()

        

        # Build prompt with persona + context + topic

        prompt = self._build_prompt(topic, previous_posts, covered_topics)

        

        # Generate post

        post_text = self.llm.generate(prompt)

        

        # Generate rationale

        rationale = self._generate_rationale(topic)

        

        return {

            'text': post_text,

            'rationale': rationale

        }

    

    def *build*prompt(self, topic, history, covered_topics):

        """Build the generation prompt"""

        return f"""

        You are {[self.name](http://self.name)}, a {self.domain} expert.

        

        Your voice: {self.voice}

        Your interests: {self.interests}

        

        Topics you've covered: {', '.join(covered_topics)}

        

        Recent posts:

        {history}

        

        Now, write a post about this topic:

        {topic}

        

        Make sure it's:

        - Original and insightful

        - In your consistent voice

        - Building on previous discussions

        - Relevant to current AI/tech developments

        

        Don't repeat what you've said before. Provide fresh perspective.

        """

5. Scheduler &amp; Autonomous Loop

python

import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from datetime import datetime, timedelta

class AutonomousAgent:

    def **init**(self):

        self.agent_id = None

        self.persona = None

        self.memory = MemorySystem()

        self.judge = None

        self.discovery = TopicDiscovery()

        self.scheduler = AsyncIOScheduler()

        [self.is](http://self.is)_running = False

        

    def initialize(self, persona_config):

        """Initialize the agent with persona"""

        self.agent_id = str(uuid.uuid4())

        self.persona = PersonaEngine(persona_config)

        self.judge = EditorialJudge(self.persona)

        [self.is](http://self.is)_running = True

        

        # Schedule autonomous publishing

        self.scheduler.add_job(

            self._publish_cycle,

            'interval',

            minutes=15,  # Check for new content every 15 mins

            id='publish_cycle'

        )

        

        # Schedule content refresh

        self.scheduler.add_job(

            self._refresh_topics,

            'interval',

            hours=1,

            id='refresh_topics'

        )

        

        self.scheduler.start()

        return self.agent_id

    

    async def *publish*cycle(self):

        """Main autonomous publishing cycle"""

        if not [self.is](http://self.is)_running:

            return

        

        # 1. Discover topics

        topics = [self.discovery.discover](http://self.discovery.discover)_topics()

        

        # 2. Evaluate topics

        for topic in topics[:10]:  # Top 10 candidates

            should_publish, reason = self.judge.should_publish(topic, self.memory)

            

            if should_publish:

                # 3. Generate post

                post_data = self.persona.generate_post(topic, self.memory, self.judge)

                

                # 4. Create post object

                post = {

                    'id': f"p{len(self.memory.posts) + 1}",

                    'createdAt': [datetime.now](http://datetime.now)().isoformat(),

                    'text': post_data['text'],

                    'rationale': post_data['rationale'],

                    'sources': topic.get('sources', [])

                }

                

                # 5. Store in memory

                self.memory.add_post(post)

                

                # 6. Log the action (optional)

                print(f"Published: {post['id']} at {post['createdAt']}")

                

                # Wait a bit between posts

                await asyncio.sleep(60)

                break  # One post per cycle

    

    async def *refresh*topics(self):

        """Refresh topic cache"""

        # Pre-fetch topics for faster decision-making

        pass

    

    def get_feed(self, limit=20):

        """Retrieve the feed"""

        posts = self.memory.get_posts(limit)

        return {'posts': posts}

6. API Implementation (FastAPI)

python

from fastapi import FastAPI, HTTPException

from pydantic import BaseModel

import uvicorn

app = FastAPI()

agent = AutonomousAgent()

class PersonaRequest(BaseModel):

    persona: dict

class AgentResponse(BaseModel):

    agentId: str

class FeedResponse(BaseModel):

    posts: list

@[app.post](http://app.post)("/api/agent/init", response_model=AgentResponse)

async def initialize_agent(request: PersonaRequest):

    """Initialize the autonomous agent"""

    agent_id = agent.initialize(request.persona)

    return {"agentId": agent_id}

@app.get("/api/agent/feed", response_model=FeedResponse)

async def get_feed(agentId: str):

    """Retrieve the feed of published posts"""

    # Verify agent exists

    if agent.agent_id != agentId:

        raise HTTPException(status_code=404, detail="Agent not found")

    

    # Get feed from memory

    feed = agent.get_feed()

    return feed

if **name** == "__main__":

    [uvicorn.run](http://uvicorn.run)(app, host="0.0.0.0", port=8000)

Deployment Considerations

1. Persistence

python

# Save state periodically

class PersistentMemory(MemorySystem):

    def **init**(self, storage_path):

        super().__init__()

        [self.storage](http://self.storage)_path = storage_path

        self._load_state()

    

    def *save*state(self):

        with open([self.storage](http://self.storage)_path, 'w') as f:

            json.dump(self.posts, f)

    

    def *load*state(self):

        try:

            with open([self.storage](http://self.storage)_path, 'r') as f:

                self.posts = json.load(f)

        except FileNotFoundError:

            pass

    

    def add_post(self, post):

        super().add_post(post)

        self._save_state()

2. Environment Variables

python

import os

class Config:

    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

    NEWS_API_KEY = os.getenv('NEWS_API_KEY')

    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

    PUBLISH_INTERVAL = int(os.getenv('PUBLISH_INTERVAL', '15'))  # minutes

3. Data Sources Implementation

python

class HackerNewsSource:

    async def fetch(self):

        """Fetch top stories from Hacker News"""

        async with aiohttp.ClientSession() as session:

            # Get top stories

            async with session.get('[https://hacker-news.firebaseio.com/v0/topstories.json](https://hacker-news.firebaseio.com/v0/topstories.json)') as resp:

                story_ids = await resp.json()

            

            # Get details for first 20 stories

            stories = []

            for story_id in story_ids[:20]:

                async with session.get(f'[https://hacker-news.firebaseio.com/v0/item/{story_id}.json](https://hacker-news.firebaseio.com/v0/item/{story_id}.json)') as resp:

                    story = await resp.json()

                    if story and 'title' in story:

                        stories.append({

                            'title': story['title'],

                            'url': story.get('url', ''),

                            'source': 'Hacker News',

                            'score': story.get('score', 0),

                            'timestamp': datetime.fromtimestamp(story.get('time', 0))

                        })

            return stories

and this is my strategy to solve this problem and the website i made it , so connect the backend and logic according to the problem statement and make it workable with all the logic and all also i gave you a breeth api key to connect and also connect llm pesona to this agent 



 

bascically i want to genetae an ai agent which can automate the manual posting in social mdeia sites and handles so to solve this problem i want to generate an ai agent which can automates these thinga and find the right news and information and also detedct it is right or wrong or which information is essential or not what to post or not and also reject the information according to the niche and also analyze the website and make it workable with all lemfeature the website or the problem stement have been given before change it according to the problem 



ck_live_68Ngk7k_ikU1yrlGPrX9rtL4j6642Hcg5pKT8jX6mXA

this is the api key for breeth api integrate it into this ai agent
