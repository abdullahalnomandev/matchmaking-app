export enum BUSINESS_OBJECT {
  PRODUCTS = 'products',
  SERVICES = 'services',
  PRODUCTS_SERVICES = 'products_and_services',
}

export enum BUSINESS_TYPE {
  B2B = 'B2B',
  B2C = 'B2C',
  B2G = 'B2G',
}

export enum BUSINESS_EXPERIENCE {
  ZERO_TWO = 'zero_two',
  THREE_FIVE = 'three_five',
  SIX_TEN = 'six_ten',
  ELEVEN_TWENTY = 'eleven_twenty',
  TWENTY_PLUS = 'twenty_plus',
}

export enum COMPANY_POSITION {
  FOUNDER = 'founder',
  CO_FOUNDER = 'co_founder',
  CEO = 'ceo',
  MANAGING_DIRECTOR = 'managing_director',
  PARTNER = 'partner',
  BOARD_MEMBER = 'board_member',
  INVESTOR = 'investor',
  COO = 'coo',
  CFO = 'cfo',
  CTO = 'cto',
  ADVISOR = 'advisor',
}

export enum USER_RANK {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  ELITE = 'Elite',
}

export enum SUPPORT_AREA {
  COMPANY_CREATION_AND_STRUCTURING = 'company_creation_and_structuring',
  LEGAL_ADVISORY = 'legal_advisory',
  CONTRACT_LAW = 'contract_law',
  CORPORATE_GOVERNANCE = 'corporate_governance',
  FINANCIAL_ADVISORY = 'financial_advisory',
  ACCOUNTING_AND_TAX = 'accounting_and_tax',
  M_AND_A_PARTNERSHIPS = 'm_and_a_partnerships',
  FUNDRAISING_AND_INVESTMENT = 'fundraising_and_investment',
  HR_AND_RECRUITMENT = 'hr_and_recruitment',
  PAYROLL_AND_COMPLIANCE = 'payroll_and_compliance',
  OPERATIONS_AND_PROCESS_OPTIMIZATION = 'operations_and_process_optimization',
  SUPPLY_CHAIN_MANAGEMENT = 'supply_chain_management',
  IT_AND_CYBERSECURITY = 'it_and_cybersecurity',
  DIGITAL_TRANSFORMATION = 'digital_transformation',
  AI_AND_AUTOMATION = 'ai_and_automation',
  MARKETING_AND_SALES_STRATEGY = 'marketing_and_sales_strategy',
  BRANDING_AND_POSITIONING = 'branding_and_positioning',
  INTERNATIONAL_EXPANSION = 'international_expansion',
  RISK_MANAGEMENT = 'risk_management',
  CRISIS_MANAGEMENT = 'crisis_management',
  ESG_AND_SUSTAINABILITY = 'esg_and_sustainability',
}

// Example mapping: key = support area, value = array of relevant business areas
export const SUPPORT_TO_BUSINESS_MAP: Record<string, string[]> = {
  company_creation_and_structuring: [
    'consulting_advisory',
    'legal_services',
    'accounting_audit',
  ],
  legal_advisory: ['legal_services'],
  contract_law: ['legal_services'],
  corporate_governance: ['consulting_advisory', 'financial_services'],
  financial_advisory: ['financial_services', 'accounting_audit'],
  accounting_and_tax: ['accounting_audit'],
  m_and_a_partnerships: ['financial_services', 'consulting_advisory'],
  fundraising_and_investment: ['financial_services'],
  hr_and_recruitment: ['hr_recruitment'],
  payroll_and_compliance: ['hr_recruitment', 'accounting_audit'],
  operations_and_process_optimization: ['consulting_advisory', 'it_software'],
  supply_chain_management: [
    'manufacturing',
    'transportation',
    'wholesale_retail',
  ],
  it_and_cybersecurity: ['it_software', 'telecommunications'],
  digital_transformation: ['it_software', 'consulting_advisory'],
  ai_and_automation: ['it_software', 'ai_data_analytics'],
  marketing_and_sales_strategy: [
    'marketing_advertising',
    'ecommerce_marketplaces',
  ],
  branding_and_positioning: ['marketing_advertising'],
  international_expansion: ['consulting_advisory', 'financial_services'],
  risk_management: ['financial_services', 'insurance'],
  crisis_management: ['consulting_advisory', 'risk_management'],
  esg_and_sustainability: ['environmental_services'],
};
