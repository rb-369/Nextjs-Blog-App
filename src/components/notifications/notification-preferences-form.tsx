"use client";

import { updateNotificationPreferences } from "@/actions/social-actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface NotificationPreferencesFormProps {
	initialValues: {
		notifyCommentsOnMyPosts: boolean;
		notifyNewPostsFromFollowedAuthors: boolean;
		notifyRepliesToMyComments: boolean;
	};
}

function NotificationPreferencesForm({ initialValues }: NotificationPreferencesFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [values, setValues] = useState(initialValues);

	const handleToggle = (key: keyof typeof values) => {
		setValues((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleSave = () => {
		startTransition(async () => {
			const result = await updateNotificationPreferences(values);
			if (!result.success) {
				toast(result.message ?? "Failed to save preferences");
				return;
			}

			toast("Notification preferences updated");
			router.refresh();
		});
	};

	return (
		<section className="rounded-2xl border bg-card/70 p-5">
			<h2 className="text-lg font-semibold">Notification Preferences</h2>
			<p className="mt-1 text-sm text-muted-foreground">Choose exactly which events should appear in your notification center.</p>

			<div className="mt-4 space-y-3">
				<label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
					<span>Comments on my posts</span>
					<input
						type="checkbox"
						checked={values.notifyCommentsOnMyPosts}
						onChange={() => handleToggle("notifyCommentsOnMyPosts")}
						disabled={isPending}
					/>
				</label>

				<label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
					<span>New posts from followed authors</span>
					<input
						type="checkbox"
						checked={values.notifyNewPostsFromFollowedAuthors}
						onChange={() => handleToggle("notifyNewPostsFromFollowedAuthors")}
						disabled={isPending}
					/>
				</label>

				<label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
					<span>Replies to my comments</span>
					<input
						type="checkbox"
						checked={values.notifyRepliesToMyComments}
						onChange={() => handleToggle("notifyRepliesToMyComments")}
						disabled={isPending}
					/>
				</label>
			</div>

			<Button className="mt-4" onClick={handleSave} disabled={isPending}>
				{isPending ? "Saving..." : "Save Preferences"}
			</Button>
		</section>
	);
}

export default NotificationPreferencesForm;
