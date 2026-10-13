import React from "react";
import "./globals.css";

export const metadata = {
  title: "Google Lakehouse Studio | Native Google Cloud Data & AI Workspace",
  description:
    "Google Lakehouse Studio mirroring Databricks workflows (Polyglot Notebooks, Unity Catalog, Delta Live Tables, Clusters, MLflow/Mosaic AI) powered natively by Google Cloud (BigQuery, Dataplex, Dataproc Serverless, Dataflow, Vertex AI).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-[#1A73E8]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
