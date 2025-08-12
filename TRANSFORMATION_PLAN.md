# Job Scraping Board Transformation Plan

## 🚨 IMPORTANT INSTRUCTIONS FOR DEVELOPMENT

### ALWAYS Use Context7
- **MANDATORY**: Use Context7 for ALL development tasks
- This ensures up-to-date code analysis and proper understanding of the codebase
- Run Context7 before making any changes to understand current state

### Use Firecrawl MCP
- **REQUIRED**: Use the installed Firecrawl MCP tools for web scraping
- Available tools: `mcp__firecrawl__firecrawl_scrape`, `mcp__firecrawl__firecrawl_crawl`, etc.
- Do NOT install separate Firecrawl packages - use the MCP integration

### Database Setup (External Task)
- **DATABASE**: Use Supabase for PostgreSQL database
- **ACTION REQUIRED**: Set up Supabase project at https://supabase.com
- Create database and get connection string
- Configure environment variables for database access

### Validation
- **MANDATORY**: Use Zod for all data validation
- Install: `npm install zod`
- Validate all API inputs, database schemas, and form data

### Testing Approach
- Each phase MUST be tested before proceeding to the next
- Create checkpoints where you can demonstrate progress
- Break large tasks into small, verifiable pieces

## Overview
Transform the current Next.js shopping platform into a comprehensive job scraping board that combines volume from major job sites (JobSpy) with exclusive opportunities from company career pages (Firecrawl MCP).

## Phase 1A: Initial Setup & Validation (MUST TEST EACH STEP)

### 🎯 Checkpoint 1A.1: Package Installation
**Goal**: Install core dependencies and validate they work
```bash
npm install zod prisma @prisma/client node-cron
pip install python-jobspy
```
**Test**: 
- Run `npx prisma --version` 
- Import zod in a test file: `import { z } from 'zod'`
- Test JobSpy: `python -c "import jobspy; print('JobSpy works')"`

**STOP HERE** - Show me the installation is successful before proceeding.

---

### 🎯 Checkpoint 1A.2: Supabase Database Connection
**Goal**: Connect to Supabase PostgreSQL database

**Prerequisites** (External Task for You):
1. Create Supabase project at https://supabase.com
2. Get database URL from project settings
3. Add to `.env.local`: `DATABASE_URL="postgresql://..."`

**Tasks**:
- Create `lib/prisma.ts` with Supabase connection
- Test connection with simple query

**Test**: 
- Run `npx prisma db pull` to test connection
- Create and run a simple database query

**STOP HERE** - Show me the database connection works before proceeding.

---

### 🎯 Checkpoint 1A.3: Basic Schema Setup
**Goal**: Create minimal job table with Zod validation

**Tasks**:
- Create `prisma/schema.prisma` with basic Job model
- Create Zod schemas in `lib/validations/job.ts`
- Run first migration

**Prisma Schema**:
```prisma
model Job {
  id          String   @id @default(cuid())
  title       String
  company     String
  location    String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("jobs")
}
```

**Zod Schema**:
```typescript
import { z } from 'zod'

export const JobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
})
```

**Test**: 
- Run `npx prisma migrate dev`
- Create a test job via Prisma Studio
- Validate data with Zod schema

**STOP HERE** - Show me the basic schema and validation work before proceeding.

---

## Phase 1B: API Foundation (MUST TEST EACH STEP)

### 🎯 Checkpoint 1B.1: Basic Job CRUD API
**Goal**: Create and test basic job management endpoints

**Tasks**:
- Create `app/api/jobs/route.ts` (GET, POST)
- Create `app/api/jobs/[id]/route.ts` (GET, PUT, DELETE)
- Add Zod validation to all endpoints
- Use Context7 to understand current API structure

**API Endpoints**:
```typescript
// GET /api/jobs - List jobs with pagination
// POST /api/jobs - Create new job (with Zod validation)
// GET /api/jobs/[id] - Get specific job
// PUT /api/jobs/[id] - Update job
// DELETE /api/jobs/[id] - Delete job
```

**Test**: 
- Test all CRUD operations via API calls
- Verify Zod validation rejects invalid data
- Test pagination works

**STOP HERE** - Show me the CRUD API works before proceeding.

---

### 🎯 Checkpoint 1B.2: Simple Web Scraping Test
**Goal**: Test Firecrawl MCP integration with one company page

**Tasks**:
- Create `app/api/scraping/test/route.ts`
- Use `mcp__firecrawl__firecrawl_scrape` to scrape one job site
- Parse and save jobs to database with Zod validation

**Test Endpoint**:
```typescript
// POST /api/scraping/test
// Body: { url: "https://company-careers.com" }
// Returns: { jobsFound: number, jobs: Job[] }
```

**Test**: 
- Scrape 1-2 company career pages
- Verify jobs are saved to database
- Check Zod validation works on scraped data

**STOP HERE** - Show me the scraping integration works before proceeding.

---

## Phase 1C: Frontend Basic Integration (MUST TEST EACH STEP)

### 🎯 Checkpoint 1C.1: Update Job Display Components
**Goal**: Update existing components to work with new job data structure

**Prerequisites**: Use Context7 to analyze current components first

**Tasks**:
- Update `JobListingCard.tsx` for new job data structure
- Update `JobSearchForm.tsx` with basic search functionality  
- Test with real job data from database

**Test**: 
- Load jobs from database and display them
- Test search functionality works
- Verify UI components render correctly

**STOP HERE** - Show me the updated components work with database data before proceeding.

---

### 🎯 Checkpoint 1C.2: Job Detail Pages
**Goal**: Create job detail pages with application functionality

**Tasks**:
- Create `app/jobs/[id]/page.tsx`
- Add job application tracking
- Update navigation

**Test**: 
- Navigate to job details from job list
- Test job application functionality
- Verify data loads correctly

**STOP HERE** - Show me job detail pages work before proceeding.

---

## Phase 2A: Enhanced Scraping (MUST TEST EACH STEP)

### 🎯 Checkpoint 2A.1: JobSpy Integration
**Goal**: Create Python subprocess wrapper for JobSpy

**Tasks**:
- Create `lib/services/jobspy-scraper.ts`
- Create Python script wrapper
- Add Zod validation for JobSpy data
- Test with Indeed scraping

**Python Wrapper Example**:
```python
# scripts/jobspy-scraper.py
import json
import sys
from jobspy import scrape_jobs

def scrape_jobs_for_api(search_term, location, site):
    jobs = scrape_jobs(
        site_name=[site],
        search_term=search_term,
        location=location,
        results_wanted=50
    )
    return jobs.to_dict('records')

if __name__ == "__main__":
    search_term = sys.argv[1]
    location = sys.argv[2] 
    site = sys.argv[3]
    
    result = scrape_jobs_for_api(search_term, location, site)
    print(json.dumps(result))
```

**Test**: 
- Scrape 20-50 jobs from Indeed
- Validate data with Zod schemas
- Save to database successfully

**STOP HERE** - Show me JobSpy integration works before proceeding.

---

### 🎯 Checkpoint 2A.2: Advanced Firecrawl Scraping
**Goal**: Create systematic company career page scraping

**Tasks**:
- Create `lib/services/firecrawl-scraper.ts`
- Use `mcp__firecrawl__firecrawl_crawl` for comprehensive scraping
- Add company management system
- Create scraping queue system

**Company Model Addition**:
```prisma
model Company {
  id            String   @id @default(cuid())
  name          String   @unique
  careerUrl     String
  lastScraped   DateTime?
  totalJobs     Int      @default(0)
  scrapingEnabled Boolean @default(true)
  createdAt     DateTime @default(now())
  
  jobs          Job[]    @relation("CompanyJobs")
  
  @@map("companies")
}
```

**Test**: 
- Add 5-10 companies to database
- Scrape their career pages
- Verify job extraction and storage

**STOP HERE** - Show me advanced scraping works before proceeding.

---

### 🎯 Checkpoint 2A.3: Data Deduplication & Quality
**Goal**: Implement data processing pipeline with deduplication

**Tasks**:
- Create `lib/services/data-processor.ts`
- Add fuzzy matching for duplicate jobs
- Implement job quality scoring
- Add data enrichment (skill extraction)

**Extended Job Model**:
```prisma
model Job {
  id           String   @id @default(cuid())
  title        String
  company      String
  location     String?
  description  String?
  requirements String?
  salaryMin    Int?
  salaryMax    Int?
  jobType      String?  // full-time, part-time, contract
  isRemote     Boolean  @default(false)
  applyUrl     String?
  sourceUrl    String?
  sourceType   String   // jobspy, firecrawl
  qualityScore Int      @default(0)
  skills       Json?    // Array of extracted skills
  isActive     Boolean  @default(true)
  scrapedAt    DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  companyId    String?
  company_rel  Company? @relation("CompanyJobs", fields: [companyId], references: [id])
  
  @@unique([title, company, location])
  @@map("jobs")
}
```

**Test**: 
- Import duplicate jobs and verify deduplication
- Test quality scoring algorithm
- Verify skill extraction works

**STOP HERE** - Show me data processing pipeline works before proceeding.

---

## Phase 2B: Advanced Features (MUST TEST EACH STEP)

### 🎯 Checkpoint 2B.1: Job Scheduling & Automation
**Goal**: Implement automated scraping with cron jobs

**Tasks**:
- Create `lib/services/job-scheduler.ts`
- Setup cron jobs for daily JobSpy scraping
- Setup weekly Firecrawl company updates
- Add scraping logs and monitoring

**Cron Schedule Example**:
```typescript
// Daily JobSpy scraping at 2 AM
cron.schedule('0 2 * * *', async () => {
  await runJobSpyScraping()
})

// Weekly Firecrawl at 3 AM Sunday
cron.schedule('0 3 * * 0', async () => {
  await runFirecrawlScraping()
})
```

**Test**: 
- Test manual trigger of scheduled jobs
- Verify logs are created
- Check error handling works

**STOP HERE** - Show me scheduling works before proceeding.

---

### 🎯 Checkpoint 2B.2: Admin Dashboard Backend
**Goal**: Create admin API endpoints for monitoring

**Tasks**:
- Create `app/api/admin/dashboard/route.ts`
- Create `app/api/admin/scraping-logs/route.ts`
- Add scraping statistics endpoint
- Add manual scraping triggers

**Admin APIs**:
```typescript
// GET /api/admin/dashboard - Overview stats
// GET /api/admin/scraping-logs - Scraping history
// POST /api/admin/scraping/trigger - Manual scraping
// GET /api/admin/jobs/stats - Job statistics
```

**Test**: 
- Test all admin endpoints
- Verify data accuracy
- Test manual scraping triggers

**STOP HERE** - Show me admin backend works before proceeding.

---

## Phase 3A: Enhanced Frontend (MUST TEST EACH STEP)

### 🎯 Checkpoint 3A.1: Advanced Job Search & Filters
**Goal**: Create comprehensive job search with filters

**Prerequisites**: Use Context7 to analyze current search implementation

**Tasks**:
- Enhance search with salary, location, remote filters
- Add job type filtering
- Implement advanced search UI
- Add search result sorting

**Search Features**:
- Text search in title/description  
- Salary range filter
- Location/Remote toggle
- Job type filter (full-time, contract, etc.)
- Company filter
- Date posted filter

**Test**: 
- Test all filter combinations
- Verify search performance
- Test pagination with filters

**STOP HERE** - Show me enhanced search works before proceeding.

---

### 🎯 Checkpoint 3A.2: Company Pages & Profiles
**Goal**: Create company-specific job listings

**Tasks**:
- Create `app/companies/[id]/page.tsx`
- Display all jobs from a company
- Show company information
- Add company following feature

**Test**: 
- Navigate to company pages
- Verify all company jobs display
- Test company following

**STOP HERE** - Show me company pages work before proceeding.

---

### 🎯 Checkpoint 3A.3: Admin Dashboard Frontend
**Goal**: Create admin interface for monitoring

**Tasks**:
- Create `app/admin/page.tsx`
- Display scraping statistics
- Show recent logs
- Add manual scraping controls

**Dashboard Features**:
- Total jobs count
- Jobs scraped today/week
- Scraping success rates
- Error logs
- Manual trigger buttons

**Test**: 
- Test all dashboard features
- Verify real-time updates
- Test manual controls

**STOP HERE** - Show me admin dashboard works before proceeding.

---

## Phase 4: Production Deployment (MUST TEST EACH STEP)

### 🎯 Checkpoint 4.1: Production Database Setup
**Goal**: Deploy to production with Supabase

**External Tasks for You**:
1. **Supabase Production Setup**:
   - Create production Supabase project
   - Configure database settings
   - Set up connection pooling
   - Add environment variables to hosting platform

2. **Environment Variables**:
```bash
DATABASE_URL="postgresql://..."  # Supabase connection
NEXTAUTH_SECRET="..."           # Auth secret
NEXTAUTH_URL="https://yourdomain.com"
FIRECRAWL_API_KEY="..."        # If needed beyond MCP
```

**Tasks**:
- Update Prisma for production database
- Run production migrations
- Test database connection in production

**Test**: 
- Verify all migrations run successfully
- Test database connection from production
- Verify data persistence

**STOP HERE** - Show me production database works before proceeding.

---

### 🎯 Checkpoint 4.2: Performance Optimization
**Goal**: Optimize for production performance

**Tasks**:
- Add database indexes for search queries
- Implement API response caching
- Optimize Firecrawl MCP usage
- Add request rate limiting

**Database Indexes**:
```sql
-- Add indexes for common queries
CREATE INDEX jobs_title_search ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX jobs_company_location ON jobs(company, location);
CREATE INDEX jobs_created_at ON jobs(created_at DESC);
CREATE INDEX jobs_salary ON jobs(salary_min, salary_max);
```

**Test**: 
- Test search performance with large dataset
- Verify API response times
- Test rate limiting

**STOP HERE** - Show me performance optimization works before proceeding.

---

### 🎯 Checkpoint 4.3: Monitoring & Error Handling
**Goal**: Add production monitoring

**Tasks**:
- Add comprehensive error logging
- Implement health check endpoints
- Add scraping failure notifications
- Monitor API usage and costs

**Health Check API**:
```typescript
// GET /api/health - System health check
{
  database: "connected" | "error",
  scraping: "active" | "inactive",
  lastJobsUpdate: "2024-01-01T00:00:00Z",
  totalJobs: 1000
}
```

**Test**: 
- Test error logging works
- Verify health checks respond correctly
- Test monitoring dashboard

**STOP HERE** - Show me monitoring works before proceeding.

---

## 🎯 FINAL CHECKPOINT: Full System Test

### Complete End-to-End Testing
1. **Job Scraping Flow**:
   - Trigger JobSpy scraping → Verify jobs in database
   - Trigger Firecrawl scraping → Verify company jobs
   - Check deduplication works → Verify no duplicates

2. **User Experience Flow**:
   - Search for jobs → Filter results → View job details
   - Apply for job → Track application status
   - Browse companies → View company jobs

3. **Admin Experience Flow**:
   - View dashboard → Check statistics
   - Trigger manual scraping → Monitor progress
   - Review logs → Check for errors

4. **Performance Testing**:
   - Load test with 1000+ jobs
   - Test search performance
   - Verify API response times

**SUCCESS CRITERIA**:
- ✅ All scraping works without errors
- ✅ Search returns results in < 500ms
- ✅ Admin dashboard shows real data
- ✅ No console errors on frontend
- ✅ Database queries are optimized

---

## 📋 EXTERNAL TASKS CHECKLIST FOR YOU

### Database Setup (Required Before Phase 1A.2)
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project: "job-scraping-board"
- [ ] Get database connection string from Settings → Database
- [ ] Add to `.env.local`: `DATABASE_URL="postgresql://..."`

### Domain & Hosting (Required for Production)
- [ ] Choose hosting platform (Vercel/Netlify/Railway)
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificates

### API Keys (As Needed)
- [ ] Firecrawl API key (if needed beyond MCP)
- [ ] Any additional service API keys

---

## 🔄 CURRENT WORKFLOW

**START HERE**: Begin with Phase 1A.1 (Package Installation)
**REMEMBER**: Use Context7 for ALL development tasks
**TESTING**: Stop at each checkpoint and demonstrate working functionality
**VALIDATION**: Use Zod for all data validation throughout

## Implementation Order

### Database & Core Setup
1. Setup PostgreSQL and Prisma
2. Create database schema and migrations
3. Install required packages
4. Basic API structure

### Scraping Services
1. Implement JobSpy integration
2. Implement Firecrawl integration
3. Build data processing pipeline
4. Test scraping functionality

### Frontend Updates
1. Update existing components for job data
2. Create new job board specific components
3. Update pages and navigation
4. Test user experience

###  Automation & Polish
1. Implement job scheduling
2. Build admin dashboard
3. Add monitoring and error handling
4. Performance optimization

### : Deployment & Testing
1. Setup production environment
2. Deploy and test all functionality
3. Monitor performance and fix issues
4. Launch and gather user feedback

## Success Metrics to Track
- Data freshness vs competitors
- Unique job coverage percentage
- Data quality completeness
- User engagement metrics
- Cost efficiency per job found

## Files to Preserve/Modify
- **Keep**: Most UI components (with updates)
- **Keep**: Authentication system
- **Replace**: Firebase integration → Prisma
- **Update**: API routes for job data
- **Add**: Scraping services and scheduling

This plan transforms your shopping platform into a competitive job board while leveraging your existing Next.js foundation and UI components.