"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EmbeddingsPageProps {
  listingId: string;
}

interface EmbeddingInput {
  description1: string;
  description2: string;
  categories: string[];
  preferredJobs: string[];
  jobsToAvoid: string[];
  company: string;
  street: string;
  town: string;
  city: string;
  county: string;
  country: string;
  serviceAreas: string[];
  minJobValue?: number;
  maxJobValue?: number;
  availability: string[];
  certifications: string[];
  languages: string[];
  yearsExperience?: number;
}

const availabilityOptions = ["Weekdays", "Weekends", "Emergency"];

export default function EmbeddingsPage({ listingId }: EmbeddingsPageProps) {
  const router = useRouter();

  const [form, setForm] = useState<EmbeddingInput>({
    description1: "",
    description2: "",
    categories: [],
    preferredJobs: [],
    jobsToAvoid: [],
    company: "",
    street: "",
    town: "",
    city: "",
    county: "",
    country: "",
    serviceAreas: [],
    minJobValue: undefined,
    maxJobValue: undefined,
    availability: [],
    certifications: [],
    languages: [],
    yearsExperience: undefined,
  });

  // Temporary text states for comma-separated inputs
  const [categoriesStr, setCategoriesStr] = useState("");
  const [preferredStr, setPreferredStr] = useState("");
  const [avoidStr, setAvoidStr] = useState("");
  const [serviceAreasStr, setServiceAreasStr] = useState("");
  const [certStr, setCertStr] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchInput() {
      try {
        const res = await fetch(`/api/getEmbeddingInput/${listingId}`);
        if (!res.ok) throw new Error("Failed to fetch embedding input");
        const result = await res.json();
        const data = result.data as EmbeddingInput;

        // Populate form and text states, guard against undefined arrays
        setForm(data);
        setCategoriesStr((data.categories ?? []).join(", "));
        setPreferredStr((data.preferredJobs ?? []).join(", "));
        setAvoidStr((data.jobsToAvoid ?? []).join(", "));
        setServiceAreasStr((data.serviceAreas ?? []).join(", "));
        setCertStr((data.certifications ?? []).join(", "));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInput();
  }, [listingId]);

  function handleChange<K extends keyof EmbeddingInput>(
    key: K,
    value: string | number
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleOption(
    field: "availability" | "languages",
    option: string
  ) {
    setForm((prev) => {
      const list = prev[field];
      const updated = list.includes(option)
        ? list.filter((i) => i !== option)
        : [...list, option];
      return { ...prev, [field]: updated };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    // Merge in parsed arrays before sending
    const payload: EmbeddingInput = {
      ...form,
      categories: categoriesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      preferredJobs: preferredStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      jobsToAvoid: avoidStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      serviceAreas: serviceAreasStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      certifications: certStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(
        `/api/updateEmbedding/${listingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      router.push(`/services/${listingId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update embedding input.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-white rounded-lg shadow"
    >
      <h1 className="text-xl font-semibold">Edit Embedding Input</h1>

      {/* Descriptions */}
      <label className="block">
        <span>Description 1</span>
        <textarea
          value={form.description1}
          onChange={(e) =>
            handleChange("description1", e.target.value)
          }
          className="w-full border p-2 rounded resize-none"
          rows={2}
          required
        />
      </label>

      <label className="block">
        <span>Description 2</span>
        <textarea
          value={form.description2}
          onChange={(e) =>
            handleChange("description2", e.target.value)
          }
          className="w-full border p-2 rounded resize-none"
          rows={2}
        />
      </label>

      {/* Comma-separated fields */}
      <label className="block">
        <span>Categories</span>
        <input
          type="text"
          value={categoriesStr}
          onChange={(e) => setCategoriesStr(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Plumbing, Carpentry"
          required
        />
      </label>

      <label className="block">
        <span>Preferred Jobs</span>
        <input
          type="text"
          value={preferredStr}
          onChange={(e) => setPreferredStr(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Remodels, Repairs"
        />
      </label>

      <label className="block">
        <span>Jobs to Avoid</span>
        <input
          type="text"
          value={avoidStr}
          onChange={(e) => setAvoidStr(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Painting, Cleaning"
        />
      </label>

      <label className="block">
        <span>Service Areas</span>
        <input
          type="text"
          value={serviceAreasStr}
          onChange={(e) =>
            setServiceAreasStr(e.target.value)
          }
          className="w-full border p-2 rounded"
          placeholder="Dublin, Cork"
          required
        />
      </label>

      {/* Company & Address */}
      <label className="block">
        <span>Company Name</span>
        <input
          type="text"
          value={form.company}
          onChange={(e) =>
            handleChange("company", e.target.value)
          }
          className="w-full border p-2 rounded"
          required
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Street"
          value={form.street}
          onChange={(e) =>
            handleChange("street", e.target.value)
          }
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Town"
          value={form.town}
          onChange={(e) =>
            handleChange("town", e.target.value)
          }
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(e) =>
            handleChange("city", e.target.value)
          }
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="County"
          value={form.county}
          onChange={(e) =>
            handleChange("county", e.target.value)
          }
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Country"
          value={form.country}
          onChange={(e) =>
            handleChange("country", e.target.value)
          }
          className="border p-2 rounded"
          required
        />
      </div>

      {/* Numeric */}
      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Min Job Value"
          value={form.minJobValue ?? ""}
          onChange={(e) =>
            handleChange("minJobValue", Number(e.target.value))
          }
          className="border p-2 rounded flex-1"
        />
        <input
          type="number"
          placeholder="Max Job Value"
          value={form.maxJobValue ?? ""}
          onChange={(e) =>
            handleChange("maxJobValue", Number(e.target.value))
          }
          className="border p-2 rounded flex-1"
        />
      </div>

      {/* Availability */}
      <fieldset>
        <legend className="font-medium">Availability</legend>
        <div className="flex gap-4 mt-2">
          {availabilityOptions.map((opt) => (
            <label key={opt} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={form.availability.includes(opt)}
                onChange={() => toggleOption("availability", opt)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Certifications */}
      <label className="block">
        <span>Certifications</span>
        <input
          type="text"
          value={certStr}
          onChange={(e) => setCertStr(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Gas Safe"
        />
      </label>


      {/* Years Experience */}
      <label className="block">
        <span>Years of Experience</span>
        <input
          type="number"
          value={form.yearsExperience ?? ""}
          onChange={(e) =>
            handleChange("yearsExperience", Number(e.target.value))
          }
          className="w-full border p-2 rounded"
          min={0}
        />
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Embedding Input"}
      </button>
    </form>
  );
}
