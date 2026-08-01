import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, Bell, HeartPulse } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — NxtHealth',
  description: 'Learn how NxtHealth protects your healthcare data, biometric credentials, and identity.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Privacy Policy
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Last Updated: August 2026
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
              At NxtHealth, we take the privacy and security of your health, identity, and personal data seriously. This Privacy Policy outlines how we collect, process, store, and protect your information across our platform.
            </p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-lg">
              <Database className="w-5 h-5 shrink-0" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              To provide a comprehensive personal health management experience, NxtHealth collects and processes several types of information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-1">A. Health & Biological Data</h3>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                  <li><strong>Health Passport & Vault:</strong> Medical history, health logs, uploaded records, family risk histories, and lifestyle metrics.</li>
                  <li><strong>Healthspan Estimator:</strong> Self-reported metrics including sleep debt, step counts, dietary patterns, stress, and substance use indicators.</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-1">B. Authentication & Identity Data</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>WebAuthn Credentials:</strong> Cryptographic public keys and hardware-backed authentication credentials (passkeys/biometrics) used to secure your account without storing raw passwords.
                </p>
              </div>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-1">C. Financial & Transaction Data</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>VisionPay & Delegate Billing:</strong> Transaction metadata, delegate details, insurance plan numbers, and payment status required for billing and fraud verification.
                </p>
              </div>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-1">D. AI & Voice Data</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>AI Assistant (PAM):</strong> Text prompts, voice interaction inputs, and contextual metadata used to generate real-time health insights and navigation support.
                </p>
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mt-2">
              <h3 className="font-bold text-gray-900 text-sm mb-1">E. Emergency Contacts</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>SOS Mailer Data:</strong> Email addresses and phone numbers of designated emergency delegates configured to receive automated emergency alerts.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-lg">
              <Eye className="w-5 h-5 shrink-0" />
              <h2>2. How We Use Your Information</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We use the collected data strictly for operational, security, and analytical health purposes:
            </p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2 list-disc list-inside pl-2">
              <li><strong>Personalized Health Tracking:</strong> To calculate long-term healthspan projections, aggregate 7-day sleep backlogs, and map family health risk profiles.</li>
              <li><strong>Secure Payment & Verification:</strong> To facilitate delegate payments, cross-reference insurance coverage, and run automated fraud checks via VisionPay.</li>
              <li><strong>Emergency Dispatch:</strong> To instantly dispatch automated emergency alerts to designated contacts when an SOS trigger is initiated.</li>
              <li><strong>System Optimization & AI Context:</strong> To provide relevant contextual answers through PAM without selling or exposing your data to third-party ad networks.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-lg">
              <Lock className="w-5 h-5 shrink-0" />
              <h2>3. Data Storage, Security & Encryption</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 border border-gray-100 rounded-2xl bg-slate-50/50">
                <h3 className="font-bold text-gray-900 text-xs mb-1">End-to-End Protection</h3>
                <p className="text-xs text-gray-600">Sensitive records stored within your Health Vault are encrypted using modern standards.</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-2xl bg-slate-50/50">
                <h3 className="font-bold text-gray-900 text-xs mb-1">Local-First Storage</h3>
                <p className="text-xs text-gray-600">Temporary session states are isolated on local device storage (localStorage) to minimize server exposure.</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-2xl bg-slate-50/50">
                <h3 className="font-bold text-gray-900 text-xs mb-1">WebAuthn Integration</h3>
                <p className="text-xs text-gray-600">We never store raw biometrics or private keys. Authentication relies on hardware-bound standard protocols.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-lg">
              <Bell className="w-5 h-5 shrink-0" />
              <h2>4. Third-Party Integrations & Processing</h2>
            </div>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li><strong>Email Services:</strong> Secure API mailers used exclusively to send SOS emergency notifications and receipt updates.</li>
              <li><strong>AI Providers:</strong> Anonymized text/voice prompts sent to processing pipelines to return assistant responses. No private medical identity details are shared with base AI models.</li>
            </ul>
          </section>

          {/* Section 5 Disclaimer */}
          <section className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-3">
            <h2 className="text-amber-900 font-bold text-base sm:text-lg flex items-center gap-2">
              <span>⚠️</span> 5. Medical & Technical Disclaimer
            </h2>
            <div className="text-xs sm:text-sm text-amber-950 space-y-2 leading-relaxed">
              <p><strong>Not Medical Advice:</strong> NxtHealth, including its Longevity Estimator, Family Risk Map, and PAM AI assistant, provides calculations and insights for informational and self-tracking purposes only. It does not offer clinical medical diagnoses or treatment advice.</p>
              <p><strong>Emergency Services:</strong> The SOS Mailer is a backup notification system and should not replace dialing official emergency response numbers in life-threatening situations.</p>
            </div>
          </section>

          {/* Section 6 & 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-3">
              <h2 className="font-bold text-gray-900 text-lg">6. Your Rights & Data Control</h2>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li><strong>Access & Export:</strong> View stored health records and payment history directly through your dashboard.</li>
                <li><strong>Data Erasure:</strong> Purge local storage, remove emergency delegates, or request complete deletion of your platform record at any time.</li>
              </ul>
            </section>
            <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-2">7. Contact Us</h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  If you have questions regarding this Privacy Policy or how your data is handled within NxtHealth, please reach out through our Help & Support page.
                </p>
              </div>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors mt-4"
              >
                <span>Visit Help & Support</span>
              </Link>
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}
