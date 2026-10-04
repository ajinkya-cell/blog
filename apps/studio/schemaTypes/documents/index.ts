import { author } from "@/schemaTypes/documents/author";
import { blog } from "@/schemaTypes/documents/blog";
import { blogIndex } from "@/schemaTypes/documents/blog-index";
import { footer } from "@/schemaTypes/documents/footer";
import { homePage } from "@/schemaTypes/documents/home-page";
import { navbar } from "@/schemaTypes/documents/navbar";
import { page } from "@/schemaTypes/documents/page";
import { project } from "@/schemaTypes/documents/project";
import { redirect } from "@/schemaTypes/documents/redirect";
import { settings } from "@/schemaTypes/documents/settings";

export const singletons = [homePage, blogIndex, settings, footer, navbar];

export const documents = [blog, project, page, author, ...singletons, redirect];
