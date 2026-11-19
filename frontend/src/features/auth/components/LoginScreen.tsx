"use client";

import { FormEvent, useState } from "react";
import { Alert, Box, Button, Chip, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowRight, BarChart3, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { authCopy } from "@/shared/copy/authCopy";
import { tradingCopy } from "@/shared/copy/tradingCopy";

interface Props { onSignIn: () => void; }

const features = [
  { title: authCopy.featureChartTitle, body: authCopy.featureChartBody },
  { title: authCopy.featurePlanTitle, body: authCopy.featurePlanBody },
  { title: authCopy.featureOrderTitle, body: authCopy.featureOrderBody },
];

export function LoginScreen({ onSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(authCopy.invalidEmail); return; }
    if (!password.trim()) { setError(authCopy.requiredPassword); return; }
    setError("");
    onSignIn();
  };

  const exploreDemo = () => {
    setEmail("trader@example.com");
    setPassword("paper-demo");
    setError("");
    onSignIn();
  };

  return <main className="login-page min-h-dvh w-full">
    <section className="login-story">
      <a className="login-brand" href="#login" aria-label={tradingCopy.app.brand}>
        <span className="brand-mark"><BarChart3 size={21} strokeWidth={2.5} /></span><span>{tradingCopy.app.brand}</span>
      </a>
      <Box className="login-story-content">
        <Chip className="login-demo-chip" icon={<span className="login-chip-dot" />} label={authCopy.demoLabel} size="small" />
        <Typography component="h1" className="login-headline">{authCopy.brandLine}</Typography>
        <Typography className="login-description">{authCopy.brandDescription}</Typography>
        <Stack className="login-feature-list" spacing={2.25}>
          {features.map((feature, index) => <Box className="login-feature" key={feature.title}>
            <span className="login-feature-icon"><CheckCircle2 size={17} /></span>
            <Box><Typography className="login-feature-title">{feature.title}</Typography><Typography className="login-feature-body">{feature.body}</Typography></Box>
            <span className="login-feature-step">0{index + 1}</span>
          </Box>)}
        </Stack>
      </Box>
      <Box className="login-story-footer"><ShieldCheck size={16} /><span><strong>{authCopy.privacyLabel}</strong>{authCopy.privacyBody}</span></Box>
    </section>

    <section className="login-form-side" id="login">
      <Paper className="login-card w-full max-w-107.5" elevation={0}>
        <Box className="login-mobile-brand"><span className="brand-mark"><BarChart3 size={20} /></span><span>{tradingCopy.app.brand}</span></Box>
        <Chip className="login-card-kicker" icon={<LockKeyhole size={13} />} label={authCopy.demoLabel} size="small" />
        <Typography component="h2" className="login-title">{authCopy.title}</Typography>
        <Typography className="login-subtitle">{authCopy.subtitle}</Typography>
        <form onSubmit={submit} noValidate>
          <Stack spacing={2.2}>
            {error && <Alert severity="error" className="login-error">{error}</Alert>}
            <TextField label={authCopy.email} placeholder={authCopy.emailPlaceholder} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField label={authCopy.password} placeholder={authCopy.passwordPlaceholder} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <Button type="submit" variant="contained" color="primary" endIcon={<ArrowRight size={17} />} className="login-submit w-full min-h-11">{authCopy.signIn}</Button>
          </Stack>
        </form>
        <Divider className="login-divider"><span>{tradingCopy.common.or}</span></Divider>
        <Button fullWidth variant="outlined" onClick={exploreDemo} className="login-explore">{authCopy.demoAccess}</Button>
        <Typography className="login-notice">{authCopy.demoNotice}</Typography>
      </Paper>
      <Typography className="login-bottom-note">{authCopy.privacyLabel}<span>·</span>{tradingCopy.order.info}</Typography>
    </section>
  </main>;
}
