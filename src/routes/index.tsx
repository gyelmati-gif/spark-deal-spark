import { createFileRoute } from "@tanstack/react-router";
import { SparkApp } from "@/components/spark/SparkApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spark Estimator" },
      { name: "description", content: "Mobile-first repair cost estimator. Repair total, MAO, and go/no-go verdict at the curb." },
      { property: "og:title", content: "Spark Estimator" },
      { property: "og:description", content: "The most important number in the deal." },
    ],
  }),
  component: SparkApp,
});
