import { createFileRoute } from "@tanstack/react-router";
import { LearnIndexPage } from "../pages/LearnIndexPage";

export const Route = createFileRoute("/learn/")({
  component: LearnIndexPage,
});
