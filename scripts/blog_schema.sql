-- ============================================================================
-- MNM Travels — Modern blog schema (MySQL 8+ / MariaDB compatible)
--
-- Reference schema for the migrated blog data. The Vite/React site currently
-- consumes src/data/blogs_database.json (the "collection" form of this exact
-- structure, produced by scripts/migrate-blogs.mjs). This file is the
-- relational equivalent if/when the site moves to a real database.
--
-- Mapping from legacy `mnmtravels`.`tbl_blogs`:
--   id                -> blogs.id (new auto-increment; legacy id kept in legacy_id)
--   heading           -> blogs.title
--   url               -> (retired) -> blogs.legacy_url for redirects
--   category_id       -> blogs.category_id (FK to blog_categories)
--   status            -> blogs.status (int 1/0 -> enum 'published'/'draft')
--   short_description -> blogs.excerpt
--   description       -> blogs.content (HTML, entities decoded)
--   title             -> blogs.seo_title
--   meta_description  -> blogs.seo_description
--   meta_keywords     -> blogs.seo_keywords
--   author            -> blogs.author
--   date              -> blogs.legacy_display_date
--   image             -> blogs.legacy_image (temporary — to be replaced)
--   image_name        -> blogs.image_alt
--   thumbnail         -> blogs.legacy_thumbnail
--   display_home      -> blogs.featured
--   datetime          -> blogs.published_at
-- ============================================================================

CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `slug`       VARCHAR(120) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blog_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `blog_categories` (`id`, `name`, `slug`) VALUES
  (1, 'India', 'india'),
  (2, 'International', 'international')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `slug` = VALUES(`slug`);

CREATE TABLE IF NOT EXISTS `blogs` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`               VARCHAR(500) NOT NULL,
  `slug`                VARCHAR(255) NOT NULL,
  `excerpt`             VARCHAR(1000) NOT NULL DEFAULT '',
  `content`             MEDIUMTEXT,                      -- full HTML content
  `featured_image`      VARCHAR(1000) DEFAULT NULL,      -- placeholder until stock pass
  `image_alt`           VARCHAR(500) DEFAULT NULL,
  `category_id`         INT UNSIGNED NOT NULL,
  `author`              VARCHAR(255) NOT NULL DEFAULT 'MNM Team',
  `read_time`           VARCHAR(50) NOT NULL DEFAULT '1 min read',
  `status`              ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `featured`            TINYINT(1) NOT NULL DEFAULT 0,  -- show on homepage
  `published_at`        DATETIME DEFAULT NULL,
  `seo_title`           VARCHAR(500) DEFAULT NULL,
  `seo_description`     VARCHAR(1000) DEFAULT NULL,
  `seo_keywords`        VARCHAR(2000) DEFAULT NULL,
  -- legacy cross-reference (redirects, image replacement, idempotent re-runs)
  `legacy_id`           INT UNSIGNED DEFAULT NULL,
  `legacy_url`          VARCHAR(500) DEFAULT NULL,
  `legacy_image`        VARCHAR(500) DEFAULT NULL,
  `legacy_thumbnail`    VARCHAR(500) DEFAULT NULL,
  `legacy_display_date` VARCHAR(100) DEFAULT NULL,
  `created_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blogs_slug` (`slug`),
  UNIQUE KEY `uq_blogs_legacy_id` (`legacy_id`),
  KEY `idx_blogs_category` (`category_id`),
  KEY `idx_blogs_status_published_at` (`status`, `published_at`),
  CONSTRAINT `fk_blogs_category`
    FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
