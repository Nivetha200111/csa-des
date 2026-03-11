const flashcardsData = [
  {
    term: "Access Control List (ACL)",
    definition:
      "Defines create, read, update, and delete permissions for data in ServiceNow tables.",
  },
  {
    term: "Application Platform-as-a-Service (aPaaS)",
    definition:
      "A cloud service model that provides tools and infrastructure for building, deploying, and managing custom applications.",
  },
  {
    term: "Application Engine Studio (AES)",
    definition:
      "A low-code environment for rapidly creating and deploying applications on the ServiceNow Platform.",
  },
  {
    term: "Application Scope",
    definition:
      "The boundary that defines where an application operates, such as a custom application scope or Global.",
  },
  {
    term: "Application Scoping",
    definition:
      "Protects application artifacts and data by limiting access based on application boundaries.",
  },
  {
    term: "Approver",
    definition:
      "A role that lets users review and act on approval records directed to them.",
  },
  {
    term: "Automated Test Framework (ATF)",
    definition:
      "A suite of tools used to automate application testing and reduce manual QA effort.",
  },
  {
    term: "Baseline Implementation",
    definition:
      "The out-of-box state of a ServiceNow instance before customization or configuration begins.",
  },
  {
    term: "Base Table",
    definition:
      "A parent table that is not itself an extension of another table.",
  },
  {
    term: "Business Rule",
    definition:
      "Server-side logic that runs before or after database actions such as insert, update, delete, query, or display.",
  },
  {
    term: "Capstone Project",
    definition:
      "A final project used to apply the knowledge and skills gained during a course.",
  },
  {
    term: "Child Class",
    definition:
      "A table that extends another table.",
  },
  {
    term: "Choice Lists",
    definition:
      "Fields that let users select from a predefined set of options.",
  },
  {
    term: "CI Class Manager",
    definition:
      "A central place to explore CMDB class hierarchy, CI table definitions, and related classes.",
  },
  {
    term: "Client",
    definition:
      "The front-end user interface where users interact with the ServiceNow system.",
  },
  {
    term: "Client Script",
    definition:
      "Client-side logic used to update fields, disable links, display messages, and react to form behavior.",
  },
  {
    term: "CMDB",
    definition:
      "The Configuration Management Database that stores configuration item data in related tables and fields.",
  },
  {
    term: "Common Service Data Model (CSDM)",
    definition:
      "A CMDB-based framework that guides where product and service data should live in ServiceNow.",
  },
  {
    term: "Configuration",
    definition:
      "Changing forms, views, categories, service catalog elements, or table extensions without rewriting platform code.",
  },
  {
    term: "Configuration Items (CIs)",
    definition:
      "The physical or logical assets, devices, applications, and services tracked in the CMDB.",
  },
  {
    term: "Context Menus",
    definition:
      "Menus that provide different control options for a list or UI context.",
  },
  {
    term: "Coalesce Fields",
    definition:
      "Fields used as a unique key during imports to match incoming data to existing records.",
  },
  {
    term: "Core Table",
    definition:
      "A table that exists in the base system.",
  },
  {
    term: "Customization",
    definition:
      "Enhancing the platform beyond baseline behavior, such as changing widgets, adding tables, or extending functionality.",
  },
  {
    term: "Customer Articles",
    definition:
      "Security Center guidance items that customers can review and act on, with statuses such as overdue or complete.",
  },
  {
    term: "Data Pill",
    definition:
      "A data container used in later workflow or flow actions.",
  },
  {
    term: "Data Policy",
    definition:
      "A rule that enforces field consistency, such as making fields mandatory or read-only across platform data entry.",
  },
  {
    term: "Dashboards",
    definition:
      "Collections of multiple visualizations from Platform Analytics that can be shared as a story with data.",
  },
  {
    term: "Dependency View",
    definition:
      "An interactive graphical view of relationships between configuration items.",
  },
  {
    term: "Discovery",
    definition:
      "Scans the network to find devices and applications and updates the CMDB with the results.",
  },
  {
    term: "Dot-Walking",
    definition:
      "Retrieving data across related tables by following reference fields.",
  },
  {
    term: "Encryption at Rest",
    definition:
      "Encryption used to protect stored data. It is not enabled by default on the standard Now Platform.",
  },
  {
    term: "Encryption in Transit",
    definition:
      "Protection for data moving between systems through HTTPS and related secure transfer methods.",
  },
  {
    term: "Field",
    definition:
      "An individual column of data in a table.",
  },
  {
    term: "Field Attributes",
    definition:
      "The actual values or settings associated with a field.",
  },
  {
    term: "Field Label",
    definition:
      "The user-friendly name shown in the interface for a field.",
  },
  {
    term: "Field Name",
    definition:
      "The system-friendly unique identifier the platform uses for a field.",
  },
  {
    term: "Filters",
    definition:
      "Conditions used to isolate a subset of records in a list.",
  },
  {
    term: "Flow",
    definition:
      "A sequence of automated actions such as looking up records, updating values, or requesting approvals.",
  },
  {
    term: "Form Builder",
    definition:
      "A tool for adding, removing, and reordering fields on forms.",
  },
  {
    term: "Groups (sys_user_group)",
    definition:
      "The table that stores user groups created for shared responsibilities such as approvals or notifications.",
  },
  {
    term: "Hardening (Compliance) Score",
    definition:
      "A Security Center score that shows how well an instance aligns with recommended security settings.",
  },
  {
    term: "HR Service Management",
    definition:
      "A set of ServiceNow applications for HR case management, onboarding, and employee self-service.",
  },
  {
    term: "Impersonation",
    definition:
      "A feature that lets administrators act as another user to test access and behavior.",
  },
  {
    term: "Import Set",
    definition:
      "A staging tool used to bring data from outside sources into ServiceNow before mapping it to target tables.",
  },
  {
    term: "Incident [incident]",
    definition:
      "The task table used to track unplanned interruptions or reductions in IT service quality.",
  },
  {
    term: "Instance",
    definition:
      "A customer-specific copy of a ServiceNow environment.",
  },
  {
    term: "Information Technology Infrastructure Library (ITIL)",
    definition:
      "A framework of best practices for delivering and managing IT services.",
  },
  {
    term: "IT Service Management (ITSM)",
    definition:
      "A suite of applications for managing IT services such as incident, change, and problem management.",
  },
  {
    term: "Key Management Framework (KMF)",
    definition:
      "A secure interface for instance-side cryptographic key management in ServiceNow.",
  },
  {
    term: "Knowledge Base",
    definition:
      "A repository where users can create, categorize, review, and publish knowledge articles.",
  },
  {
    term: "List Collector",
    definition:
      "A form layout control used to add, remove, or reorder selected values or fields.",
  },
  {
    term: "List Editor",
    definition:
      "A feature that lets users edit field values directly in a list without opening the record.",
  },
  {
    term: "List Views",
    definition:
      "Configured sets of list columns that support different work activities.",
  },
  {
    term: "Logging and Monitoring",
    definition:
      "Capabilities that let customers collect and forward logs to existing SIEM tools for policy or regulatory needs.",
  },
  {
    term: "Management, Instrumentation and Discovery Server (MID Server)",
    definition:
      "A lightweight application that securely connects ServiceNow with external systems for integration and discovery.",
  },
  {
    term: "Natural Language Query (NLQ)",
    definition:
      "A feature that lets users ask questions in everyday language to find information or generate reports.",
  },
  {
    term: "Now Assist",
    definition:
      "A ServiceNow capability that brings generative AI experiences into the platform using supported products and LLM integrations.",
  },
  {
    term: "Notifications",
    definition:
      "Alerts triggered by events in the platform to inform users about activities such as incident or change updates.",
  },
  {
    term: "Parent Class",
    definition:
      "The table from which another table extends.",
  },
  {
    term: "Patching and Upgrading the Security Center Application",
    definition:
      "Reviewing version details, installed logs, and available updates to keep Security Center current and secure.",
  },
  {
    term: "Performance Analytics",
    definition:
      "An advanced analytics tool used to track and analyze key performance indicators over time.",
  },
  {
    term: "Platform Analytics",
    definition:
      "A ServiceNow feature for creating dashboards and visualizations across data sources.",
  },
  {
    term: "Platform Security Resources",
    definition:
      "ServiceNow-provided resources that help customers improve their security posture, including Security Center documentation and programs.",
  },
  {
    term: "Plugins",
    definition:
      "Installable packages that activate applications or features, often requested from the ServiceNow Store or ServiceNow directly.",
  },
  {
    term: "Process User",
    definition:
      "A user with process-related roles who performs ITIL activities such as incident and change management.",
  },
  {
    term: "Record",
    definition:
      "A single row in a table.",
  },
  {
    term: "Record Producers",
    definition:
      "Simplified forms that turn user input into task-based records in the database.",
  },
  {
    term: "Requester (Employee Self Service)",
    definition:
      "A user without elevated roles who can submit requests, manage personal requests, and access public pages.",
  },
  {
    term: "Role",
    definition:
      "A definition used to grant access at the application, module, or ACL level.",
  },
  {
    term: "Schema Map",
    definition:
      "A visual representation of tables related to a selected table.",
  },
  {
    term: "Security Center Adoption",
    definition:
      "Establishing a recurring review cadence between teams to evaluate Security Center findings.",
  },
  {
    term: "Security Contact Field",
    definition:
      "A field that lets the ServiceNow Security Office communicate directly with customer security personnel.",
  },
  {
    term: "Security Event Notification Policies",
    definition:
      "Policies that define how security event notifications are created, managed, and delivered.",
  },
  {
    term: "Security Metrics",
    definition:
      "Analytics Hub visualizations used to monitor numerous security threats and insecure behaviors.",
  },
  {
    term: "Self Service / Self-Service",
    definition:
      "Capabilities that let users access information, services, and common tasks without direct assistance from IT or support staff.",
  },
  {
    term: "Server",
    definition:
      "The back-end side of the platform that processes requests from the client and returns responses.",
  },
  {
    term: "Service Catalog",
    definition:
      "A list of available services and requestable items for users.",
  },
  {
    term: "Service Mapping",
    definition:
      "Enhances the CMDB by identifying application relationships and dependencies between configuration items.",
  },
  {
    term: "ServiceNow",
    definition:
      "A platform that provides digital workflows to automate business processes.",
  },
  {
    term: "ServiceNow Platform",
    definition:
      "The core platform used to configure business applications, manage data, enable self-service, and improve productivity across multiple service domains.",
  },
  {
    term: "ServiceNow Security Center",
    definition:
      "A product that helps customers configure instances to meet security policies and monitor security posture.",
  },
  {
    term: "Shared Responsibility Model",
    definition:
      "A framework that explains how security responsibilities are shared between ServiceNow, the customer, and facility providers.",
  },
  {
    term: "Sidebar",
    definition:
      "A collaboration feature that supports real-time work around a workspace record or interaction-based task.",
  },
  {
    term: "Scripting in ServiceNow",
    definition:
      "Customizing an instance or application behavior using JavaScript.",
  },
  {
    term: "Specialized Administrator",
    definition:
      "A user with administrator rights for a specific function or application, such as HR, reporting, or knowledge.",
  },
  {
    term: "Source Table",
    definition:
      "The table that contains the reference field.",
  },
  {
    term: "System Administrator",
    definition:
      "A role that provides broad access to platform features, applications, functions, and data.",
  },
  {
    term: "Table",
    definition:
      "A collection of records in the database.",
  },
  {
    term: "Tags",
    definition:
      "Labels used to categorize, flag, and locate records quickly.",
  },
  {
    term: "Tasks [task]",
    definition:
      "The parent table that stores work items and activities that need to be completed.",
  },
  {
    term: "Templates",
    definition:
      "Reusable patterns that automatically populate form fields when creating records.",
  },
  {
    term: "Theme Builder",
    definition:
      "A tool for selecting logos, colors, fonts, and overall visual style for the instance.",
  },
  {
    term: "Threshold Alerts",
    definition:
      "Security Center alerts that appear when defined security thresholds are met or exceeded.",
  },
  {
    term: "Transform Map",
    definition:
      "A collection of field maps that relates import set fields to target table fields.",
  },
  {
    term: "UI Actions",
    definition:
      "Buttons, links, and context menu items added to forms and lists to make the interface more interactive.",
  },
  {
    term: "UI Policy",
    definition:
      "A client-side rule that dynamically changes form behavior or information shown on the form.",
  },
  {
    term: "Update Set",
    definition:
      "A package of configuration changes that can be moved from one instance to another.",
  },
  {
    term: "User [sys_user]",
    definition:
      "The table that stores user information, including identity, roles, and permissions.",
  },
  {
    term: "User Criteria",
    definition:
      "Conditions evaluated against users to determine access to knowledge content and related actions.",
  },
  {
    term: "Value",
    definition:
      "The actual data found where a record and field intersect.",
  },
  {
    term: "Virtual Agent",
    definition:
      "An automated assistant that helps users complete tasks and answer common questions through conversation.",
  },
  {
    term: "Vulnerability Management",
    definition:
      "A ServiceNow capability for identifying and managing infrastructure vulnerabilities across environments.",
  },
  {
    term: "Visualization Designer",
    definition:
      "A guided tool for configuring, previewing, editing, and sharing charts and data visualizations.",
  },
  {
    term: "Wildcard",
    definition:
      "A pattern used to apply access control rules to every field on a record.",
  },
  {
    term: "Workflow Studio",
    definition:
      "A tool used to create and manage workflows with triggers, actions, and data components.",
  },
];

export default flashcardsData;
