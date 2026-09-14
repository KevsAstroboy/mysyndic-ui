# Graph Report - .  (2026-09-11)

## Corpus Check
- 166 files · ~157,848 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 685 nodes · 1816 edges · 41 communities (29 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Auth Account Screens
- App Layouts & Messaging
- Admin Account Management
- Project Dependencies
- Security Dashboard Design
- Profiles & Private Chat
- TypeScript Lib References
- Payments & Cotisation
- Villa & Colocation
- Root Layout & Toasts
- Admin Dashboards & KPIs
- Documents & Incidents
- OpenSpec Workflow
- Habitant Home Dashboard
- Conflict Management
- Payment History
- Announcements
- Habitant Alerts List
- Urgent Alert Flow
- Incident Feed
- Cité Admin
- Incident Detail
- Configuration Settings
- Backend Gaps Notes
- Auth Screen Design
- Auth Architecture Notes
- Brand Assets
- Page Transitions
- Multi-Cité Cards
- Conflict Moderation Design
- Chat UI Design
- Next Config
- Next Env Types
- Tailwind Config
- Incident Card Design
- Pill Tabs Design
- Empty States Design
- Notifications Design
- Font

## God Nodes (most connected - your core abstractions)
1. `cn()` - 94 edges
2. `QUERY_KEYS` - 60 edges
3. `useAuth()` - 46 edges
4. `apiErrorMessage()` - 41 edges
5. `formatRelative()` - 32 edges
6. `Skeleton()` - 28 edges
7. `Button()` - 26 edges
8. `PageHeader()` - 23 edges
9. `useAuthStore` - 20 edges
10. `formatFCFA()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `AddVillaSheet()` --references--> `xlsx`  [EXTRACTED]
  src/app/(super-admin)/cites/page.tsx → package.json
- `opsx-apply command` --conceptually_related_to--> `spec-driven schema`  [INFERRED]
  .opencode/commands/opsx-apply.md → openspec/config.yaml
- `Listes de référence (reference endpoints)` --shares_data_with--> `lib/api API layer`  [INFERRED]
  BACKEND_ENDPOINTS_MANQUANTS.md → LEARN-NEXT.md
- `Socket.io events manquants` --shares_data_with--> `SocketSync`  [INFERRED]
  BACKEND_ENDPOINTS_MANQUANTS.md → LEARN-NEXT.md
- `ChatGateway` --shares_data_with--> `SocketSync`  [INFERRED]
  BACKEND_ENDPOINTS_MANQUANTS.md → LEARN-NEXT.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OpenSpec change lifecycle (propose → explore → apply → sync → archive)** — _opencode_commands_opsx_propose_opsx_propose, _opencode_commands_opsx_explore_opsx_explore, _opencode_commands_opsx_apply_opsx_apply, _opencode_commands_opsx_sync_opsx_sync, _opencode_commands_opsx_archive_opsx_archive [EXTRACTED 0.85]
- **MySyndic frontend/backend API contract gaps** — backend_endpoints_manquants_reference_lists, backend_endpoints_manquants_socket_events, backend_endpoints_manquants_chatgateway, learn_next_lib_api_layer, learn_next_socket_sync [INFERRED 0.85]
- **Responsive three-breakpoint layout (mobile/tablet/desktop)** — design_mysyndic_design_screen_espace_habitant_accueil, design_mysyndic_design_sidebar_nav, design_mysyndic_design_screen_espace_syndic_dashboard [INFERRED 0.85]
- **Security alert flow (report -> real-time feed -> escalation)** — design_mysyndic_design_fab_urgence, design_mysyndic_design_bottom_sheet, design_mysyndic_design_2_chef_securite_dashboard, design_mysyndic_design_2_alert_card, design_mysyndic_design_2_escalade_banner [INFERRED 0.75]
- **Design token system consolidated across mockups** — design_mysyndic_design_design_tokens, design_mysyndic_design_3_design_system_recap, design_mysyndic_design_3_tailwind_config [INFERRED 0.85]

## Communities (41 total, 12 thin omitted)

### Community 0 - "Auth Account Screens"
Cohesion: 0.06
Nodes (50): metadata, metadata, metadata, metadata, metadata, metadata, metadata, CreateSyndicSheet() (+42 more)

### Community 1 - "App Layouts & Messaging"
Cohesion: 0.07
Nodes (43): HabitantLayout(), ROLE_FOR, GroupeThreadPage(), MessagesPage(), ROLE_LABEL, ProfilPage(), Home(), ChatThread() (+35 more)

### Community 2 - "Admin Account Management"
Cohesion: 0.07
Nodes (35): ComptesPage(), CreateStaffSheet(), initials(), ROLE_STYLE, RoleTags(), Stat(), Kpi(), AnnonceForm() (+27 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.04
Nodes (44): autoprefixer, axios, framer-motion, lucide-react, next, dependencies, axios, framer-motion (+36 more)

### Community 4 - "Security Dashboard Design"
Cohesion: 0.05
Nodes (44): Alert card (critical/warning/resolved), Chef Securite real-time alert dashboard, Console Admin (account management), Dark interface for night vigilance, Escalation indicator (no response > 3 min), Modal component, Role tag component, Five user roles (habitant/syndic/securite/admin/super admin) (+36 more)

### Community 5 - "Profiles & Private Chat"
Cohesion: 0.09
Nodes (22): dirtyOf(), IMMUABLES, ProfilsFeaturesPage(), totalOf(), visibleModules(), api, API_BASE, AuthTokenResponse (+14 more)

### Community 6 - "TypeScript Lib References"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 7 - "Payments & Cotisation"
Cohesion: 0.16
Nodes (17): CotisationPage(), CANAUX, STATUTS, SyndicPaiementsPage(), HeroCard(), HeroCardProps, STATUS_MAP, BAR_COLORS (+9 more)

### Community 8 - "Villa & Colocation"
Cohesion: 0.15
Nodes (18): ColocationsPage(), SyndicHabitantsPage(), Etape, RejoindreCiteSheet(), slide(), STATUT_META, Chip(), ChipProps (+10 more)

### Community 9 - "Root Layout & Toasts"
Cohesion: 0.14
Nodes (17): jakarta, metadata, viewport, dispatchNotificationToast(), getAudioCtx(), NOTIFICATION_EVENT, NotificationToaster(), playNotificationSound() (+9 more)

### Community 10 - "Admin Dashboards & KPIs"
Cohesion: 0.20
Nodes (13): VueGlobalePage(), RevenusPage(), DashboardPage(), PeriodParams, PeriodSelector(), usePeriod(), Skeleton(), citeApi (+5 more)

### Community 11 - "Documents & Incidents"
Cohesion: 0.19
Nodes (16): DocumentsPage(), CreateCiteSheet(), SyndicDocumentsPage(), CommentItem(), IncidentDetailSheet(), isEnCours(), isResolu(), ModerationSheet() (+8 more)

### Community 12 - "OpenSpec Workflow"
Cohesion: 0.11
Nodes (21): opsx-apply command, workspace-planning guard, opsx-archive command, opsx-explore command, openspec CLI, opsx-propose command, delta spec, main spec (+13 more)

### Community 13 - "Habitant Home Dashboard"
Cohesion: 0.15
Nodes (16): AccueilPage(), ActivityItem, ActivityRow(), AnnonceCard(), compactFCFA(), DOT_TONES, IncidentCard(), incidentCategoryKey() (+8 more)

### Community 14 - "Conflict Management"
Cohesion: 0.17
Nodes (12): ConflitsPage(), SyndicConflitsPage(), ConflitCard(), STATUT_TONE, StatusPill(), StatusPillProps, StatusPillTone, toneClasses (+4 more)

### Community 15 - "Payment History"
Cohesion: 0.13
Nodes (15): HistoriqueList(), ICON_CLS, LABEL, PILL_CLS, Status, statusOf(), InitPaystackDto, AuditFields (+7 more)

### Community 16 - "Announcements"
Cohesion: 0.20
Nodes (10): AnnoncesPage(), SyndicAnnoncesPage(), ConfirmDialog(), EmptyState(), EmptyStateProps, TONE_CLS, annonceApi, PageResponse (+2 more)

### Community 17 - "Habitant Alerts List"
Cohesion: 0.19
Nodes (11): AlerteCard(), MesAlertesPage(), MOTIF_ICONS, MOTIF_TONES, STEP_CODES, STEP_LABELS, stepIndexOf(), Modal() (+3 more)

### Community 18 - "Urgent Alert Flow"
Cohesion: 0.29
Nodes (9): AlerteSheet(), MOTIF_ICONS, MOTIF_TONES, FABUrgence(), alerteApi, MesAlertesResponse, Alerte, MotifAlerte (+1 more)

### Community 19 - "Incident Feed"
Cohesion: 0.27
Nodes (9): IncidentsPage(), IncidentCard(), incidentApi, Auteur, CategorieIncident, Incident, IncidentCommentaire, IncidentDetail (+1 more)

### Community 20 - "Cité Admin"
Cohesion: 0.24
Nodes (9): AddVillaSheet(), CitesPage(), compactFCFA(), emptyRow(), isHeaderRow(), ParsedRow, TEMPLATE_EXAMPLE, TEMPLATE_HEADER (+1 more)

### Community 21 - "Incident Detail"
Cohesion: 0.33
Nodes (8): CommentItem(), IncidentDetailPage(), AlertesPage(), formatRelative(), MONTHS, parseDate(), sameDay(), timeToHM()

### Community 22 - "Configuration Settings"
Cohesion: 0.31
Nodes (4): ConfigForm(), PageHeader(), CiteConfiguration, configurationApi

### Community 23 - "Backend Gaps Notes"
Cohesion: 0.40
Nodes (6): ChatGateway, Listes de référence (reference endpoints), Socket.io events manquants, lib/api API layer, SocketSync, TanStack Query

### Community 24 - "Auth Screen Design"
Cohesion: 0.50
Nodes (4): Auth screens (login / password change / signup), Form field component, Forced password change (admin-created accounts), Password rules validator

### Community 25 - "Auth Architecture Notes"
Cohesion: 0.50
Nodes (4): authStore, axios interceptors (token refresh), middleware (route guard), Zustand

### Community 26 - "Brand Assets"
Cohesion: 0.50
Nodes (4): MySyndic Brand Identity, Green Brand Color Palette, MySyndic Logo, MySyndic Logo (Green Variant)

## Knowledge Gaps
- **191 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Admin Account Management` to `Auth Account Screens`, `App Layouts & Messaging`, `Profiles & Private Chat`, `Payments & Cotisation`, `Villa & Colocation`, `Admin Dashboards & KPIs`, `Habitant Home Dashboard`, `Conflict Management`, `Payment History`, `Announcements`, `Habitant Alerts List`, `Urgent Alert Flow`, `Incident Feed`, `Cité Admin`, `Incident Detail`, `Configuration Settings`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `AddVillaSheet()` connect `Cité Admin` to `Documents & Incidents`, `Auth Account Screens`, `Admin Account Management`, `Project Dependencies`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `xlsx` connect `Project Dependencies` to `Cité Admin`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _191 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Account Screens` be split into smaller, more focused modules?**
  _Cohesion score 0.057512797350195724 - nodes in this community are weakly interconnected._
- **Should `App Layouts & Messaging` be split into smaller, more focused modules?**
  _Cohesion score 0.06582952815829528 - nodes in this community are weakly interconnected._
- **Should `Admin Account Management` be split into smaller, more focused modules?**
  _Cohesion score 0.0726764500349406 - nodes in this community are weakly interconnected._