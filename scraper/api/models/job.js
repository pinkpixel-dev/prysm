/**
 * Job Model
 * Handles job storage, retrieval, and lifecycle management
 */
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

// In-memory job storage (replace with a database in production)
const jobs = new Map();

// File-based results storage
const RESULTS_DIR = path.join(__dirname, '../../results/api');

// Import default options from utils
const { DEFAULT_OPTIONS } = require('../../utils/defaultOptions');

// Ensure results directory exists
async function ensureResultsDir() {
  try {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating results directory:', error);
  }
}

// Initialize results directory
ensureResultsDir();

// Job status enum
const JobStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * Create a new job
 * @param {string} url - URL to scrape
 * @param {object} options - Scraping options
 * @param {number} priority - Job priority (1 = highest, 10 = lowest)
 * @param {string} webhook - Webhook URL for notifications
 * @returns {object} - Created job object
 */
async function createJob(url, options = {}, priority = 5, webhook = null) {
  const jobId = generateJobId();
  const now = new Date();
  
  // Default output paths
  const defaultOptions = {
    pages: 1,
    images: false,
    output: path.join(__dirname, '../../results'),  // Override with API-specific path
    imageOutput: path.join(__dirname, '../../results/images')
  };
  
  // Merge with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Handle legacy compatibility with main scraper
  // Convert options to match what the main scraper expects
  const scrapingOptions = {
    ...DEFAULT_OPTIONS,
    pages: mergedOptions.pages,
    images: mergedOptions.images,
    // These are required for backward compatibility
    scrapeImages: mergedOptions.images,
    downloadImages: mergedOptions.images,
    output: mergedOptions.output,
    imageOutput: mergedOptions.imageOutput,
    imageOutputDir: mergedOptions.imageOutput // For backward compatibility
  };
  
  // If pages > 1, automatically enable followLinks (for backward compatibility)
  if (mergedOptions.pages > 1) {
    scrapingOptions.followLinks = true;
  }
  
  const job = {
    jobId,
    url,
    options: scrapingOptions,
    priority,
    webhook,
    status: JobStatus.PENDING,
    createdAt: now.toISOString(),
    startedAt: null,
    completedAt: null,
    error: null,
    progress: 0
  };
  
  jobs.set(jobId, job);
  return job;
}

/**
 * Get job by ID
 * @param {string} jobId - Job identifier
 * @returns {object|null} - Job object or null if not found
 */
function getJob(jobId) {
  return jobs.get(jobId) || null;
}

/**
 * Get all jobs with optional filtering
 * @param {object} filters - Filter criteria
 * @param {number} limit - Maximum number of jobs to return
 * @param {number} offset - Offset for pagination
 * @returns {object} - Object containing jobs array and pagination info
 */
function getJobs(filters = {}, limit = 20, offset = 0) {
  let filteredJobs = Array.from(jobs.values());
  
  // Apply status filter if provided
  if (filters.status) {
    filteredJobs = filteredJobs.filter(job => job.status === filters.status);
  }
  
  // Sort by creation date (newest first)
  filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const total = filteredJobs.length;
  const paginatedJobs = filteredJobs.slice(offset, offset + limit);
  
  return {
    jobs: paginatedJobs,
    total,
    limit,
    offset
  };
}

/**
 * Update job status and details
 * @param {string} jobId - Job identifier
 * @param {object} updates - Fields to update
 * @returns {object|null} - Updated job or null if not found
 */
function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (!job) return null;
  
  // Apply updates
  Object.assign(job, updates);
  
  // Update timestamps based on status changes
  if (updates.status === JobStatus.PROCESSING && !job.startedAt) {
    job.startedAt = new Date().toISOString();
  }
  
  if ((updates.status === JobStatus.COMPLETED || updates.status === JobStatus.FAILED) && !job.completedAt) {
    job.completedAt = new Date().toISOString();
  }
  
  return job;
}

/**
 * Delete a job and its results
 * @param {string} jobId - Job identifier
 * @returns {boolean} - Whether the job was deleted
 */
async function deleteJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return false;
  
  // Delete job results if they exist
  try {
    const resultsPath = path.join(RESULTS_DIR, `${jobId}.json`);
    await fs.unlink(resultsPath).catch(() => {});
  } catch (error) {
    console.warn(`Failed to delete results for job ${jobId}:`, error);
  }
  
  // Remove job from memory
  return jobs.delete(jobId);
}

/**
 * Store job results
 * @param {string} jobId - Job identifier
 * @param {object} results - Scraping results
 * @returns {boolean} - Whether results were stored successfully
 */
async function storeResults(jobId, results) {
  try {
    const resultsPath = path.join(RESULTS_DIR, `${jobId}.json`);
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    return true;
  } catch (error) {
    console.error(`Error storing results for job ${jobId}:`, error);
    return false;
  }
}

/**
 * Get job results
 * @param {string} jobId - Job identifier
 * @returns {object|null} - Job results or null if not found
 */
async function getResults(jobId) {
  try {
    const resultsPath = path.join(RESULTS_DIR, `${jobId}.json`);
    const data = await fs.readFile(resultsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading results for job ${jobId}:`, error);
    return null;
  }
}

/**
 * Generate a unique job ID
 * @returns {string} - Unique job identifier
 */
function generateJobId() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = {
  JobStatus,
  createJob,
  getJob,
  getJobs,
  updateJob,
  deleteJob,
  storeResults,
  getResults
}; 