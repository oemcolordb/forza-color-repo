---
name: data-audit
description: 'Audit JSON datasets, database seeds, and APIs for duplicates, mock data, and AI hallucinated entries. Use to ensure data authenticity and remove placeholder content.'
argument-hint: 'Specify the file or dataset to audit'
---

# Data Integrity Audit

This skill provides a systematic approach for auditing datasets, database seeds, and static JSON files to ensure they contain authentic data free from hallucinations, duplicates, or mock placeholders.

## When to Use
- Before migrating a dataset to production.
- When reviewing AI-generated JSON or database seeds.
- If users report incorrect, historically inaccurate, or duplicate records (e.g., "hallucinated" data).

## Procedure

### 1. Identify and Scope the Data Source
- Locate the primary dataset (e.g., `cars.json`, `public/data.json`, database seed files).
- Identify any redundant fallback or sample files that might also need to be kept in sync.
- Check the size and structure of the dataset to determine the best auditing method (manual review vs. programmatic script).

### 2. Deduplication Check
- Identify the unique composite key for the data (e.g., `manufacturer` + `model` + `year`).
- Scan the dataset for duplicate entries sharing this key.
- **Action**: If duplicates are found, determine the merge strategy (e.g., keep the entry with the most complete stats, or keep the newest record).

### 3. Mock Data and Hallucination Check
- **Scan for Patterns**: Look for obvious placeholder values (e.g., generic years used repeatedly across different items, boilerplate names, or default ID numbers).
- **Cross-Reference Reality**: Verify entries against real-world or domain-specific facts (e.g., authenticating Forza Horizon 5 car rosters vs. fake models).
- **Assess Scope of Contamination**: Determine if the dataset has isolated errors or if the entire array is synthetically generated/hallucinated.

### 4. Remediation and Replacement
- **For isolated errors**: Manually correct or remove the fake entries.
- **For widespread hallucinations**: Do not attempt to patch a wildly inaccurate dataset. Instead, completely swap the list with an authentic, verified source export.
- Write an automation script (e.g., Node.js or PowerShell) if necessary to overwrite the bad data across all locations in the workspace.

## Quality Criteria
- All entries correctly match real domain facts.
- No duplicate records based on the unique composite key.
- Dependent APIs and UIs still function correctly with the replaced authentic data.
