## Wedding Officiant Finder - Deep Dive

### The Core Problem
Right now, finding a wedding officiant in Ontario is a mess:
- **Government data is unusable**: 1.4MB CSV with ~14,000 officiants, last/first name, city, affiliation. That's it. No contact info, no specialties, no availability.
- **Couples resort to**: Google searches, wedding vendor directories (cluttered with ads), Facebook groups, asking married friends, cold-calling churches
- **Officiants struggle too**: No easy way to be discovered. Many are part-time and don't have marketing budgets.

### What Your Tool Does

**For Couples:**
1. **Smart Search Interface**
   - Location: "Brighton, Ontario" → shows officiants within X km radius
   - Ceremony type: Religious (specific denomination), Spiritual but not religious, Secular/civil, Interfaith, LGBTQ+ friendly
   - Language preferences
   - Date availability
   - Style preferences: Traditional, casual, custom vows, short ceremony, etc.

2. **AI-Powered Officiant Profiles** (this is where your Lantern skills shine)
   - You scrape/aggregate data from: Ontario registry + web search + their websites + reviews
   - AI generates: Plain-language profile summaries, ceremony style descriptions, what makes them unique
   - Shows: Sample ceremonies, pricing (if available), booking process

3. **Personalized Outreach Generator**
   - Couple fills in: wedding date, venue, their story, what they're looking for
   - AI generates customized inquiry emails to send to 3-5 officiants
   - Tone matches what officiants respond to (you'd learn this from data)
   - Template: "We're Phil and [fiancée], getting married [date] at [venue]. We're looking for [style]. Here's what resonated about your profile..."

**For Officiants:**
4. **Free Basic Listing** (from government data)
   - Verified from Ontario registry
   - Contact form through your platform
   
5. **Premium Enhanced Profile** ($10-30/month or $100-200/year)
   - Photos, videos, detailed bio
   - Calendar integration (show availability)
   - Custom ceremony samples
   - Review collection
   - Priority in search results
   - Lead notifications
   - Analytics: who's viewing, inquiry conversion rates

### The Business Model

**Revenue Streams:**
1. **Officiant subscriptions**: $15/month or $150/year for enhanced profiles
   - If you get 100 officiants paying → $15k/year
   - If you get 500 officiants → $75k/year
   
2. **Lead fees**: $5-10 per qualified couple introduction
   - Alternative to subscriptions for officiants who only do a few weddings/year

3. **Couple premium features** (optional):
   - $20 "Concierge Match" - AI analyzes their preferences, vets 3-5 perfect matches, handles outreach
   - $50 "Full Service" - Includes ceremony planning templates, vow writing assistance, timeline checklist

4. **Affiliate revenue**: 
   - Partner with wedding venues, photographers, planners
   - "You found your officiant, here are recommended venues in your area"

### Why This Works For You

**Leverages Your Strengths:**
- **Communications background**: You understand how to craft effective outreach messages
- **AI/automation skills**: You've built Lantern - this is the same concept (intake → AI processing → quality output)
- **Understanding the market**: You're literally planning a wedding in Ontario RIGHT NOW
- **Government data wrangling**: You know how to work with structured datasets

**Technical Feasibility:**
- Government data is clean, structured, updated regularly
- Web scraping officiant websites is straightforward
- AI writing assistant is exactly what you've already built
- Search/filter interface is standard web dev

**Market Validation:**
- The Ontario registry dataset is the #1 most viewed on data.ontario.ca
- Every couple needs an officiant (unlike many wedding vendors that are optional)
- ~70,000 marriages in Ontario per year
- Average officiant cost: $500-800
- People are actively searching for this

### MVP Features (Start Simple)

**Version 1.0 (2-3 weeks of work):**
1. Import Ontario officiant registry
2. Basic search: location radius, religious affiliation filters
3. Display results with contact info (scraped from web if available)
4. AI-generated inquiry email template
5. Simple landing page explaining the service

**Version 1.5 (next month):**
6. Officiant registration → claim your profile
7. Enhanced profiles for paying officiants
8. Review system
9. Availability calendar

**Version 2.0 (3 months):**
10. Couple accounts (save searches, track outreach)
11. Officiant dashboard with analytics
12. Ceremony planning tools
13. Expand to other provinces (BC, Alberta registry data)

### Marketing Strategy

**Launch:**
- Reddit: r/WeddingsCanada, r/ontario, wedding planning subs
- Facebook: Ontario wedding planning groups
- SEO: "wedding officiant near me" + Ontario city names
- Instagram: Before/after of "finding an officiant the old way vs. our way"

**Growth:**
- Content marketing: "How to choose a wedding officiant in Ontario" blog posts
- Partner with wedding planners (they need officiant referrals constantly)
- Reach out to officiants directly: "We're helping couples find you"
- Wedding shows/expos (once you have traction)

### Competition Analysis

**Current "solutions":**
- **WeddingWire/The Knot**: Cluttered, vendor-heavy, not Ontario-specific, poor officiant coverage
- **Google**: Hit or miss, no curation, time-consuming
- **Direct registry search**: Unusable for most people

**Your advantage:**
- Ontario-focused (local SEO easier)
- Clean, purpose-built interface
- AI-powered matching and outreach (unique)
- Built by someone planning a wedding (authentic marketing)

### Validation Steps Before Building

1. **Survey 10 recently married couples**: "How did you find your officiant? What was hard about it?"
2. **Interview 5 officiants**: "How do couples find you? Would you pay for better visibility?"
3. **Test the demand**: Create simple landing page, run $100 in Facebook ads to engaged couples in Ontario, see if they sign up for "notify me when we launch"


