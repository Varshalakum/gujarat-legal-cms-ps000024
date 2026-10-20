import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    govTitle: 'Government of Gujarat',
    appTitle: 'Legal Case Management System',
    dashboard: 'Dashboard',
    cases: 'Cases & Litigation',
    hearings: 'Hearings & Cause List',
    bills: 'Advocate Fee Bills',
    approvals: 'Sanctions & Approvals',
    payments: 'Treasury Payments',
    budget: 'Budget Monitoring',
    reports: 'Statutory Reports',
    notifications: 'Notifications',
    audit: 'Audit Trail',
    admin: 'Administration',
    logout: 'Logout',
    switchRole: 'Switch Role',
    panelsDirectory: 'Panels Directory',
    publicPortal: 'Public Portal',
    liveApi: 'Live API',
    mockMode: 'Mock Mode',
    roles: {
      ADVOCATE: 'Advocate / Standing Counsel',
      LEGAL_OFFICER: 'Legal Officer (OIC)',
      VERIFIER: 'Bill Scrutiny Verifier',
      APPROVER: 'Sanctioning Approver (Secretary)',
      FINANCE_OFFICER: 'Finance & Treasury Officer',
      DEPARTMENT_HEAD: 'Department Head / Pr. Secretary',
      ADMIN: 'System Administrator',
      AUDITOR: 'Statutory Auditor (CAG)',
    },
    actions: {
      submit: 'Submit',
      approve: 'Approve',
      reject: 'Reject',
      return: 'Return with Query',
      disburse: 'Disburse Payment',
      verify: 'Verify Documents',
    }
  },
  gu: {
    govTitle: 'ગુજરાત સરકાર',
    appTitle: 'કાનૂની કેસ વ્યવસ્થાપન પ્રણાલી',
    dashboard: 'ડેશબોર્ડ',
    cases: 'કોર્ટ કેસ અને મુકદ્દમા',
    hearings: 'સુનાવણી અને કોઝ લિસ્ટ',
    bills: 'વકીલ ફી બિલો',
    approvals: 'મંજૂરી અને નાણાકીય મંજૂરી',
    payments: 'તિજોરી ચૂકવણી રજિસ્ટર',
    budget: 'બજેટ મોનિટરિંગ',
    reports: 'વૈધાનિક અહેવાલો',
    notifications: 'સૂચનાઓ',
    audit: 'ઓડિટ ટ્રેલ',
    admin: 'વહીવટી વ્યવસ્થા',
    logout: 'લૉગઆઉટ',
    switchRole: 'ભૂમિકા બદલો',
    panelsDirectory: 'પેનલ્સ ડિરેક્ટરી',
    publicPortal: 'જાહેર પોર્ટલ',
    liveApi: 'લાઇવ API',
    mockMode: 'મૉક મોડ',
    roles: {
      ADVOCATE: 'વકીલ / સરકારી કાઉન્સિલ',
      LEGAL_OFFICER: 'કાયદા અધિકારી (OIC)',
      VERIFIER: 'બિલ ચકાસણી અધિકારી (₹0 મંજૂરી)',
      APPROVER: 'મંજૂરી અધિકારી (સચિવ - ₹2 લાખ સુધી)',
      FINANCE_OFFICER: 'નાણાં અને તિજોરી અધિકારી',
      DEPARTMENT_HEAD: 'વિભાગના વડા (અગ્ર સચિવ - ₹2 લાખથી વધુ)',
      ADMIN: 'સિસ્ટમ એડમિનિસ્ટ્રેટર',
      AUDITOR: 'વૈધાનિક ઓડિટર (CAG)',
    },
    actions: {
      submit: 'સબમિટ કરો',
      approve: 'મંજૂર કરો',
      reject: 'અસ્વીકાર કરો',
      return: 'વાંધા સાથે પરત કરો',
      disburse: 'ચૂકવણી કરો',
      verify: 'દસ્તાવેજો ચકાસો',
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'gu' : 'en'));
  };

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[lang];
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
