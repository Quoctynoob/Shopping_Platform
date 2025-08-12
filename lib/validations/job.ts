import { z } from 'zod'

export const JobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  description: z.string().optional(),
})

export const JobCreateSchema = JobSchema

export const JobUpdateSchema = JobSchema.partial()

export const JobQuerySchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
})

export type JobInput = z.infer<typeof JobSchema>
export type JobCreateInput = z.infer<typeof JobCreateSchema>
export type JobUpdateInput = z.infer<typeof JobUpdateSchema>
export type JobQuery = z.infer<typeof JobQuerySchema>