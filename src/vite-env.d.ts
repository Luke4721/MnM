/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Razorpay Key ID — rzp_test_… for sandbox, rzp_live_… for production. */
  readonly VITE_RAZORPAY_KEY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
