# Deployment Guide for Vercel

This guide outlines the steps to deploy the **GyanPatra** MultiLang News Hub to Vercel. Because the project consists of a separate backend (Express) and frontend (React/Vite), we will deploy them as two separate Vercel projects.

## Prerequisites

-   A [Vercel](https://vercel.com/) account.
-   [Vercel CLI](https://vercel.com/docs/cli) installed (optional, but recommended) or connected GitHub repository.
-   A [MongoDB Atlas](https://www.mongodb.com/atlas/database) connection string.

## 1. Deploying the Backend

The backend is an Express application that uses Puppeteer for scraping. We have optimized it to work on Vercel's Serverless Functions by excluding the heavy Chrome binary.

1.  **Push your code to GitHub/GitLab/Bitbucket.**
2.  **Import Project in Vercel:**
    -   Go to your Vercel Dashboard and click **"Add New..."** -> **"Project"**.
    -   Select your repository.
3.  **Configure Project:**
    -   **Framework Preset:** Select **"Other"**.
    -   **Root Directory:** Click "Edit" and select `backend`.
    -   **Build Command:** Leave default (or empty).
    -   **Output Directory:** Leave default.
    -   **Install Command:** `npm install` (default is fine).
4.  **Environment Variables:**
    Expand the "Environment Variables" section and add the following:

    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `MONGODB_URI` | `mongodb+srv://<user>:<password>@...` | Your MongoDB Atlas connection string. |
    | `CLIENT_URI` | `https://your-frontend-project.vercel.app` | The URL of your deployed frontend (you can update this later after deploying frontend). |
    | `NODE_ENV` | `production` | Sets the environment to production. |
    | `CRON_SECRET` | `(random string)` | (Optional) Secures your cron jobs if triggered via URL. |

5.  **Deploy:** Click **"Deploy"**.

> [!NOTE]
> Vercel will install dependencies. Since `puppeteer` is in `devDependencies`, it won't be installed, keeping the bundle size small. The code uses `@sparticuz/chromium` (which is in `dependencies`) to run a lightweight Chromium on Vercel.

## 2. Deploying the Frontend

The frontend is a Vite + React application.

1.  **Add New Project in Vercel:**
    -   Go to Dashboard -> **"Add New..."** -> **"Project"**.
    -   Select the **SAME** repository again.
2.  **Configure Project:**
    -   **Framework Preset:** Vercel should auto-detect **"Vite"**.
    -   **Root Directory:** Click "Edit" and select `frontend`.
    -   **Build Command:** `vite build` (default).
    -   **Output Directory:** `dist` (default).
3.  **Environment Variables:**
    Add the following:

    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `VITE_API_BASE_URL` | `https://your-backend-project.vercel.app/api` | **Crucial:** The full URL of your deployed backend (ending in `/api`). |

4.  **Deploy:** Click **"Deploy"**.

## 3. Final Configuration

1.  **Update Backend CORS:**
    -   Once the frontend is deployed, copy its URL (e.g., `https://gyanpatra-frontend.vercel.app`).
    -   Go to your **Backend Project** settings in Vercel -> **Environment Variables**.
    -   Update (or add) `CLIENT_URI` with the frontend URL.
    -   **Redeploy** the backend for the changes to take effect (Go to Deployments -> Redeploy).

2.  **Verify:**
    -   Open your frontend URL.
    -   Check the "News" section. It should fetch data from the backend.
    -   If you see CORS errors in the console, double-check the `CLIENT_URI` variable and ensure it does **not** have a trailing slash.

## Troubleshooting

-   **500 Errors on Scraping:** Check Vercel Function logs. If you see memory errors, you might need to increase memory in `vercel.json` (already set to 1024MB) or upgrade to a Pro plan for longer timeouts (default is 10s, we configured `maxDuration: 60` but it requires Pro for >10s).
-   **Puppeteer Crash:** Ensure `@sparticuz/chromium` is compatible with the `puppeteer-core` version. We are using `puppeteer-core@24` and `@sparticuz/chromium@131+`.
