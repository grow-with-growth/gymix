# Database Indexing Strategy

## Overview

This document outlines the indexing strategy for the GROW YouR NEED SaaS School Provider platform based on analysis of query patterns in the application code.

## Query Pattern Analysis

### Calendar Events Collection
- **Common Filters**: `date >= 'YYYY-MM-DD' && date <= 'YYYY-MM-DD'`, `user = 'user_id'`
- **Common Sorts**: `date` (ascending)
- **Search Patterns**: None identified

### Users Collection (Auth)
- **Common Filters**: `department = 'department_name'`, `role = 'role_name'`
- **Common Sorts**: `name` (ascending)
- **Search Patterns**: `name ~ 'query'`, `email ~ 'query'`, `department ~ 'query'`

### Emails Collection
- **Common Filters**: `folder = 'folder_name'`, `sender = 'user_id'`, `recipients ~ 'user_id'`
- **Common Sorts**: `timestamp` (descending)
- **Search Patterns**: `subject ~ 'query'`, `body ~ 'query'`

### Knowledge Articles Collection
- **Common Filters**: `author = 'user_id'`
- **Common Sorts**: `title` (ascending)
- **Search Patterns**: `title ~ 'query'`, `content ~ 'query'`

### Marketplace Products Collection
- **Common Filters**: `category = 'category_name'`
- **Common Sorts**: `name` (ascending)
- **Search Patterns**: None identified

### Games Collection
- **Common Filters**: `category = 'category_name'`
- **Common Sorts**: `title` (ascending)
- **Search Patterns**: None identified

### Media Content Collection
- **Common Filters**: `type = 'type_name'`
- **Common Sorts**: `title` (ascending)
- **Search Patterns**: None identified

### Files Collection
- **Common Filters**: `folder = 'folder_name'`, `uploader = 'user_id'`
- **Common Sorts**: None identified
- **Search Patterns**: None identified

## Recommended Indexes

### Primary Indexes (Already Handled by PocketBase)
- All collections have automatic indexes on `id` and `created`/`updated` fields

### Secondary Indexes to Create

#### Calendar Events
1. **date_index**: Index on `date` field for date range queries
2. **user_date_index**: Compound index on `user` and `date` for user-specific calendar queries
3. **type_date_index**: Compound index on `type` and `date` for filtering by event type

#### Users (Auth Collection)
1. **department_index**: Index on `department` field for department filtering
2. **role_index**: Index on `role` field for role-based queries
3. **name_index**: Index on `name` field for sorting and searching
4. **email_index**: Index on `email` field for user lookup and search

#### Emails
1. **folder_timestamp_index**: Compound index on `folder` and `timestamp` for folder-based queries with timestamp sorting
2. **sender_timestamp_index**: Compound index on `sender` and `timestamp` for sent emails
3. **timestamp_index**: Index on `timestamp` for general timestamp sorting
4. **unread_folder_index**: Compound index on `unread` and `folder` for unread email queries

#### Knowledge Articles
1. **author_index**: Index on `author` field for author-specific queries
2. **title_index**: Index on `title` field for sorting and searching
3. **tags_index**: Index on `tags` array field for tag-based filtering

#### Marketplace Products
1. **category_name_index**: Compound index on `category` and `name` for category filtering with name sorting
2. **price_index**: Index on `price` field for price-based queries
3. **stock_index**: Index on `stock` field for inventory queries

#### Games
1. **category_title_index**: Compound index on `category` and `title` for category filtering with title sorting

#### Media Content
1. **type_title_index**: Compound index on `type` and `title` for type filtering with title sorting

#### Files
1. **folder_index**: Index on `folder` field for folder-based queries
2. **uploader_index**: Index on `uploader` field for user-specific file queries
3. **folder_uploader_index**: Compound index on `folder` and `uploader` for combined filtering

## Performance Considerations

### Index Maintenance
- Indexes will be automatically maintained by PocketBase
- Monitor query performance after index creation
- Consider removing unused indexes if they impact write performance

### Query Optimization
- Use compound indexes for multi-field queries
- Order compound index fields by selectivity (most selective first)
- Consider covering indexes for frequently accessed fields

### Storage Impact
- Each index requires additional storage space
- Monitor database size after index creation
- Balance query performance with storage requirements

## Implementation Plan

1. Create migration script to add all recommended indexes
2. Test query performance with indexes in development environment
3. Monitor index usage and effectiveness
4. Adjust indexes based on actual usage patterns
5. Document any performance improvements or issues

## Monitoring and Maintenance

- Regularly review query performance logs
- Monitor index usage statistics
- Update indexes as query patterns evolve
- Consider periodic index rebuilding for optimal performance