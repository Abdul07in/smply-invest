import { AuthGate } from "@/features/auth/components/AuthGate";

export default function HomePage() {
  return <AuthGate />;
}
