CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`staff_id` text NOT NULL,
	`staff_name` text,
	`market` text,
	`dept` text,
	`date` text NOT NULL,
	`clock_in` text,
	`clock_out` text,
	`device` text,
	`late` integer DEFAULT 0,
	`duration` integer
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text,
	`action` text,
	`detail` text,
	`timestamp` text
);
--> statement-breakpoint
CREATE TABLE `daily_summary` (
	`date` text NOT NULL,
	`market` text,
	`staff_count` integer DEFAULT 0,
	`present` integer DEFAULT 0,
	`absent` integer DEFAULT 0,
	`late` integer DEFAULT 0,
	`on_time` integer DEFAULT 0,
	`avg_clock_in` text,
	`generated_at` text
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text,
	`market` text,
	`serial` text,
	`location` text,
	`active` integer DEFAULT 1,
	`last_seen` text,
	`clocks_today` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `markets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`manager` text,
	`capacity` integer,
	`days` text,
	`active` integer DEFAULT 1,
	`desc` text
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`first` text NOT NULL,
	`last` text NOT NULL,
	`dept` text,
	`market` text,
	`phone` text,
	`role` text,
	`salary` real,
	`active` integer DEFAULT 1,
	`auth_level` text DEFAULT 'OFFICER',
	`password` text
);
