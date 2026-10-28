/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Razorpay Key ID — rzp_test_… for sandbox, rzp_live_… for production. */
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_OPENROUTER_KEY?: string;
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_BOLNA_KEY?: string;
  readonly VITE_BOLNA_AGENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const process: {
  env?: Record<string, string | undefined>;
};

