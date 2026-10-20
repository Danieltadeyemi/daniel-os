import { useState, useRef, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskStatus = "todo" | "inprogress" | "done";
type Priority = "high" | "med" | "low";

interface Task {
  id: number;
  title: string;
  priority: Priority;
  due: string;
  status: TaskStatus;
  group?: string;
}

interface DesignAsset {
  id: number;
  name: string;
  type: string;
  status: "Not started" | "In progress" | "In Review" | "Blocked" | "Done";
  briefedBy: string;
  due: string;
  priority: string;
}

interface KPI {
  id: number;
  label: string;
  current: number;
  target: number;
  unit: string;
  trend: "up" | "neutral" | "down";
}

interface Article {
  id: number;
  title: string;
  category: string;
  date: string;
  platform: string;
}

interface PipelineItem {
  id: number;
  title: string;
  category: string;
  targetDate: string;
  stage: "Ideas" | "Researching" | "Writing" | "Editing" | "Published";
}

interface Interview {
  id: number;
  name: string;
  org: string;
  role: string;
  status: "Planned" | "Scheduled" | "Done" | "Transcribed";
  themes: string;
}

interface Chapter {
  id: number;
  title: string;
  status: "Not started" | "Drafting" | "Reviewing" | "Done";
  progress: number;
  notes: string;
}

interface ClientKPI {
  id: number;
  client: string;
  metric: string;
  current: number;
  target: number;
  unit: string;
}

interface Project {
  id: number;
  name: string;
  client: string;
  status: "On Track" | "At Risk" | "Completed" | "On Hold";
  nextMilestone: string;
  due: string;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initWorkTasks: Task[] = [
  { id: 1,  group: "Meeting Notes", title: "Sync with Fidelis on sales process & conversion support", priority: "high", due: "Jun 9",  status: "todo" },
  { id: 2,  group: "Meeting Notes", title: "Submit LinkedIn strategy review notes to team",            priority: "high", due: "Jun 4",  status: "todo" },
  { id: 3,  group: "Meeting Notes", title: "Share Tech Safari brochure for team review once received", priority: "med",  due: "Jun 9",  status: "todo" },
  { id: 4,  group: "Meeting Notes", title: "Review Trot website copy — jobs-to-be-done lens",          priority: "high", due: "Jun 6",  status: "todo" },
  { id: 5,  group: "Meeting Notes", title: "Sync with Subomi to consolidate Trot copy feedback",       priority: "high", due: "Jun 6",  status: "todo" },
  { id: 6,  group: "Meeting Notes", title: "Send Trot website revision notes to Malik",                priority: "high", due: "Jun 9",  status: "todo" },
  { id: 7,  group: "Meeting Notes", title: "Recommend gift box vendor — 30k/unit budget",              priority: "med",  due: "Jun 7",  status: "todo" },
  { id: 8,  group: "Meeting Notes", title: "Brief printer on retreat card specs & branding",           priority: "low",  due: "Jun 7",  status: "todo" },
  { id: 9,  group: "Weekly Update", title: "Chase OnePIN lead status from sales — top lead of the year", priority: "high", due: "Jun 9",  status: "todo" },
  { id: 10, group: "Weekly Update", title: "Get May MQL→SQL conversion from sales — update all 32 Pipeline entries", priority: "high", due: "Jun 9",  status: "todo" },
  { id: 11, group: "Weekly Update", title: "Confirm June deliverable ownership: MoR report, expansion calc, Q2 asset", priority: "high", due: "Jun 9",  status: "todo" },
  { id: 12, group: "Weekly Update", title: "Remove legacy GA4 tracking tag from merchant dashboard",   priority: "med",  due: "Jun 13", status: "todo" },
  { id: 13, group: "Weekly Update", title: "Define marketing → sales lead handoff workflow",           priority: "med",  due: "Jun 13", status: "todo" },
  { id: 14, group: "Weekly Update", title: "Update social media & blog metrics for team (by Friday)",  priority: "med",  due: "Jun 7",  status: "todo" },
  { id: 15, group: "Strategy", title: "Review marketing dashboard — Monday ritual",               priority: "high", due: "Jun 9",  status: "todo" },
  { id: 16, group: "Strategy", title: "Write campaign brief for expansion calculator launch",     priority: "high", due: "Jun 9",  status: "todo" },
  { id: 17, group: "Strategy", title: "Launch expansion calculator campaign (delayed from Jun 1)", priority: "high", due: "Jun 9",  status: "todo" },
  { id: 18, group: "Strategy", title: "Publish State of MoR in Africa report",                   priority: "high", due: "Jun 15", status: "todo" },
  { id: 19, group: "Strategy", title: "Weekly sales sync — understand deal blockers, bring back to team", priority: "high", due: "Jun 9",  status: "todo" },
  { id: 20, group: "Strategy", title: "Pull organic traffic baseline from GA4 for May",          priority: "med",  due: "Jun 9",  status: "todo" },
  { id: 21, group: "Strategy", title: "Get Subomi's proposed engagement rate & newsletter targets", priority: "med",  due: "Jun 9",  status: "todo" },
  { id: 22, group: "Strategy", title: "Brief team on ABM top 200 accounts program",              priority: "med",  due: "Jun 20", status: "todo" },
  { id: 23, group: "Strategy", title: "Write & run Q2 unconventional experiment",                priority: "med",  due: "Jun 30", status: "todo" },
  { id: 24, group: "Strategy", title: "Own events calendar — confirm Q3 summits & speaking slots", priority: "low",  due: "Jun 20", status: "todo" },
  { id: 25, group: "Strategy", title: "Confirm Q2 lead-gen asset ship date & owner",             priority: "high", due: "Jun 13", status: "todo" },
];

// Source: Notion Weekly Standup · Week of Jun 9, 2026
const standupTeam = [
  { name: "Subomi", role: "Content Marketer",  focus: "Content calendar + social, blog + newsletter publish, writing guidelines, speaker invite (Mallick)", blockers: "Needs to sync with Dami on newsletter",  updated: "Jun 9", fresh: true  },
  { name: "Dami",   role: "Product Marketer",  focus: "Messaging & positioning doc, 2 tutorial videos, product blogpost + email, Slack release announcement, Q2 mini-report outline", blockers: "Unspecified — needs follow-up", updated: "Jun 9", fresh: true  },
  { name: "Sevi",   role: "Marketing Designer", focus: "—", blockers: "—", updated: "Pending", fresh: false },
];

// Source: Notion Design Tracker · synced Jun 9, 2026
const initDesignAssets: DesignAsset[] = [
  { id: 1,  name: "SB brand guideline completion",                                 type: "Social", status: "In progress", briefedBy: "Daniel",        due: "Jun 30", priority: "Critical" },
  { id: 2,  name: "Rework expansion calculator (stills and motion)",               type: "Social", status: "In progress", briefedBy: "Daniel",        due: "May 29", priority: "Normal"   },
  { id: 3,  name: "African Tax guide for Startups (Mini Report)",                  type: "Social", status: "In progress", briefedBy: "Daniel & Dami", due: "May 30", priority: "High"     },
  { id: 4,  name: "Appreciative Card design",                                      type: "Merch",  status: "Done",        briefedBy: "Daniel",        due: "Jun 5",  priority: "Normal"   },
  { id: 5,  name: "Blogpost header design",                                        type: "Web UI", status: "Done",        briefedBy: "Dami",          due: "Jun 5",  priority: "Normal"   },
  { id: 6,  name: "Social media carousel design",                                  type: "Social", status: "Done",        briefedBy: "Subomi",        due: "Jun 5",  priority: "Normal"   },
  { id: 7,  name: "Fx corner newsletter design",                                   type: "Social", status: "Done",        briefedBy: "Dami",          due: "Jun 5",  priority: "Normal"   },
  { id: 8,  name: "SB social media carousel design",                               type: "Social", status: "Done",        briefedBy: "Subomi",        due: "Jun 3",  priority: "Normal"   },
  { id: 9,  name: "SB social media design",                                        type: "Social", status: "Done",        briefedBy: "Subomi",        due: "May 27", priority: "Normal"   },
  { id: 10, name: "SB eid creative",                                               type: "Social", status: "Done",        briefedBy: "Subomi",        due: "May 27", priority: "Normal"   },
  { id: 11, name: "Social media post (MOR 2 ani)",                                 type: "Social", status: "Done",        briefedBy: "Dami",          due: "May 25", priority: "Normal"   },
  { id: 12, name: "SB versus blogpost design edit",                                type: "Social", status: "Done",        briefedBy: "Dami",          due: "May 21", priority: "Normal"   },
  { id: 13, name: "Social media post (MOR 1 ani)",                                 type: "Social", status: "Done",        briefedBy: "Dami",          due: "May 19", priority: "Normal"   },
  { id: 14, name: "SB retreat accessories (stanley, tote, pen, note + off white)", type: "Merch",  status: "Done",        briefedBy: "Daniel",        due: "May 15", priority: "High"     },
  { id: 15, name: "SB retreat merch (jerseys, jacket)",                            type: "Merch",  status: "Done",        briefedBy: "Daniel",        due: "May 15", priority: "High"     },
];

const initKPIs: KPI[] = [
  { id: 1, label: "MQLs this month (Jun)",      current: 2,  target: 15, unit: "",   trend: "neutral" },
  { id: 2, label: "MQL → SQL conversion",       current: 20, target: 25, unit: "%",  trend: "neutral" },
  { id: 3, label: "Marketing-influenced TPV",   current: 0,  target: 25, unit: "$M", trend: "neutral" },
  { id: 4, label: "Q2 Unconventional experiment", current: 0, target: 1, unit: "",   trend: "neutral" },
];

const publishedArticles: Article[] = [
  { id: 1, title: "DLM: From losing ₦20M to building a 'Company Factory'",                                              category: "Bets",      date: "19 Feb 2026", platform: "questinghq.com" },
  { id: 2, title: "3x Revenue: How Kelechi Nwaozuzu Scaled Café One",                                                   category: "Bets",      date: "5 Mar 2026",  platform: "questinghq.com" },
  { id: 3, title: "Feranmi Ajetomobi on the marketing lies of AI tools and Crypto airdrops",                            category: "Bets",      date: "19 Mar 2026", platform: "questinghq.com" },
  { id: 4, title: "Why your Partnerships keep dying",                                                                    category: "Survival",  date: "2 Apr 2026",  platform: "questinghq.com" },
  { id: 5, title: "Zero Budget. $1M Deposits: Inside FairMoney's Leanest Product Launch",                               category: "Survival",  date: "16 Apr 2026", platform: "questinghq.com" },
  { id: 6, title: "$7.3m gets Swoop into Lagos. Surviving it is a different problem",                                    category: "Expansion", date: "30 Apr 2026", platform: "questinghq.com" },
  { id: 7, title: "Highest revenue in six months: How Bukayo Ewuoso turned dormant accounts into active ones at Eskimi", category: "Bets",      date: "14 May 2026", platform: "questinghq.com" },
  { id: 8, title: "What Your Employee Perks Can't Fix",                                                                  category: "People",    date: "29 May 2026", platform: "questinghq.com" },
];

const categoryTargets: Record<string, number> = { Bets: 40, Survival: 25, Expansion: 20, People: 15 };
const catColors = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];
const catKeys   = ["Bets", "Survival", "Expansion", "People"];

const initPipeline: PipelineItem[] = [
  { id: 1, title: "Building a Community driven Sports Club",      category: "Bets",      targetDate: "11 Jun", stage: "Editing"     },
  { id: 2, title: "Autogon: Building a better fraud detection tool", category: "Bets",   targetDate: "TBD",    stage: "Ideas"       },
  { id: 3, title: "Nose: Pay by Transfer",                        category: "Expansion", targetDate: "TBD",    stage: "Ideas"       },
  { id: 4, title: "Rise: Talent Retention",                       category: "People",    targetDate: "TBD",    stage: "Researching" },
  { id: 5, title: "Levi Cee: Sales",                              category: "Bets",      targetDate: "TBD",    stage: "Researching" },
];

const initQuestingTasks: Task[] = [
  { id: 1, title: "Publish edition #9 — David Odunlami (Sports Club)", priority: "high", due: "Jun 11", status: "inprogress" },
  { id: 2, title: "Schedule interview: Autogon founder",                priority: "high", due: "Jun 13", status: "todo"       },
  { id: 3, title: "Schedule interview: Levi Cee (Sales)",              priority: "med",  due: "Jun 13", status: "todo"       },
  { id: 4, title: "Research: Rise talent retention angle",             priority: "med",  due: "Jun 20", status: "todo"       },
  { id: 5, title: "Grow subscriber list — run LinkedIn promo",         priority: "med",  due: "Jun 30", status: "todo"       },
  { id: 6, title: "Set up referral incentive for new subscribers",     priority: "low",  due: "—",      status: "todo"       },
];

const initInterviews: Interview[] = [
  { id: 1, name: "Dotun Adekanmbi",   org: "Journalist",    role: "Early Days witness",     status: "Done", themes: "Early MTN Nigeria coverage, launch era"     },
  { id: 2, name: "Harry Nnanke",      org: "CIL",           role: "Employee — Auction era", status: "Done", themes: "Spectrum auction, early infrastructure"      },
  { id: 3, name: "Obinna Nweje",      org: "Ex-MTN Staff",  role: "Build era",              status: "Done", themes: "Internal MTN operations, network build-out"  },
  { id: 4, name: "Bolaji Balogun",    org: "Econet",        role: "Early executive",        status: "Done", themes: "Econet origins, pre-MTN landscape"           },
  { id: 5, name: "Calixthus Okoruwa", org: "MTN Nigeria",   role: "Former PR Manager",      status: "Done", themes: "Brand building, public narrative"            },
  { id: 6, name: "Afam Edozie",       org: "MTN Nigeria",   role: "Early CMO",              status: "Done", themes: "Marketing strategy, consumer acquisition"    },
];

const initChapters: Chapter[] = [
  { id: 1, title: "Prologue: Before MTN",              status: "Not started", progress: 0, notes: "Nigeria before telecoms — the context"                          },
  { id: 2, title: "Chapter 1: The Auction",             status: "Not started", progress: 0, notes: "How MTN won the spectrum — Harry Nnanke, Bolaji Balogun"        },
  { id: 3, title: "Chapter 2: Early Days",              status: "Not started", progress: 0, notes: "Dotun Adekanmbi, press coverage, first impressions"             },
  { id: 4, title: "Chapter 3: Building the Network",   status: "Not started", progress: 0, notes: "Obinna Nweje — infrastructure, operations"                      },
  { id: 5, title: "Chapter 4: Selling Nigeria on Mobile", status: "Not started", progress: 0, notes: "Afam Edozie (CMO), Calixthus Okoruwa (PR) — brand building"  },
  { id: 6, title: "Chapter 5: What MTN Changed",       status: "Not started", progress: 0, notes: "Social, economic, cultural impact"                              },
  { id: 7, title: "Epilogue: What Comes Next",         status: "Not started", progress: 0, notes: "MTN's future and Africa's telecom landscape"                    },
];

const initBookTasks: Task[] = [
  { id: 1, title: "Review and tag themes across all 6 interview folders",    priority: "high", due: "Jun 15", status: "todo" },
  { id: 2, title: "Identify gaps — who else needs to be interviewed?",       priority: "high", due: "Jun 15", status: "todo" },
  { id: 3, title: "Write chapter outline based on interview themes",         priority: "high", due: "Jun 20", status: "todo" },
  { id: 4, title: "Draft chapter 1 narrative from Dotun + Harry interviews", priority: "med",  due: "Jun 30", status: "todo" },
  { id: 5, title: "Send outline to editor / trusted reader for feedback",    priority: "med",  due: "—",      status: "todo" },
  { id: 6, title: "Add Podcast folder recordings to research base",          priority: "low",  due: "—",      status: "todo" },
];

const initConsultingTasks: Task[] = [
  { id: 1, title: "Draft proposal for MTN Media Strategy",      priority: "high", due: "Jun 10", status: "inprogress" },
  { id: 2, title: "Send June invoice to Client A",              priority: "high", due: "Jun 7",  status: "todo"       },
  { id: 3, title: "Prep deck for Q3 strategy review",           priority: "med",  due: "Jun 15", status: "todo"       },
  { id: 4, title: "Follow up on Client B deliverable sign-off", priority: "med",  due: "Jun 9",  status: "todo"       },
];

const clientKPIs: ClientKPI[] = [
  { id: 1, client: "Client A", metric: "Deliverables Completed",   current: 3,    target: 5,    unit: ""  },
  { id: 2, client: "Client B", metric: "Monthly Retainer Revenue", current: 2500, target: 4000, unit: "$" },
  { id: 3, client: "Client C", metric: "Content Pieces Delivered", current: 8,    target: 12,   unit: ""  },
];

const initProjects: Project[] = [
  { id: 1, name: "MTN Media Strategy",         client: "MTN Group", status: "On Track", nextMilestone: "Strategy deck presentation", due: "Jun 15" },
  { id: 2, name: "Fintech Brand Audit",         client: "Client B",  status: "At Risk",  nextMilestone: "Final report delivery",       due: "Jun 12" },
  { id: 3, name: "Africa Market Entry Content", client: "Client C",  status: "On Track", nextMilestone: "Month 3 content batch",       due: "Jun 30" },
];

// ─── Style Maps ───────────────────────────────────────────────────────────────

const priorityStyle: Record<Priority, string> = {
  high: "bg-red-500/15 text-red-400 border border-red-500/25",
  med:  "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  low:  "bg-slate-600/30 text-slate-400 border border-slate-600/40",
};
const statusCycle: Record<TaskStatus, TaskStatus> = { todo: "inprogress", inprogress: "done", done: "todo" };
const priorityCycle: Record<Priority, Priority>   = { high: "med", med: "low", low: "high" };
const statusLabel: Record<TaskStatus, string>     = { todo: "To Do", inprogress: "In Progress", done: "Done" };
const statusStyle: Record<TaskStatus, string>     = {
  todo: "bg-slate-700/60 text-slate-400", inprogress: "bg-blue-500/15 text-blue-400", done: "bg-emerald-500/15 text-emerald-400",
};
const designStatusStyle: Record<string, string> = {
  "Not started": "bg-slate-600/30 text-slate-400", "In progress": "bg-blue-500/15 text-blue-400",
  "In Review":   "bg-amber-500/15 text-amber-400",  Blocked:       "bg-red-500/15 text-red-400",
  Done:          "bg-emerald-500/15 text-emerald-400",
};
const interviewStatusStyle: Record<string, string> = {
  Planned: "bg-slate-600/30 text-slate-400", Scheduled: "bg-blue-500/15 text-blue-400",
  Done:    "bg-amber-500/15 text-amber-400",  Transcribed: "bg-emerald-500/15 text-emerald-400",
};
const chapterStatusStyle: Record<string, string> = {
  "Not started": "bg-slate-600/30 text-slate-500", Drafting:  "bg-blue-500/15 text-blue-400",
  Reviewing:     "bg-amber-500/15 text-amber-400",  Done:      "bg-emerald-500/15 text-emerald-400",
};
const projectStatusStyle: Record<string, string> = {
  "On Track": "bg-emerald-500/15 text-emerald-400", "At Risk": "bg-amber-500/15 text-amber-400",
  Completed:  "bg-blue-500/15 text-blue-400",        "On Hold": "bg-slate-600/30 text-slate-400",
};

// ─── Shared Components ────────────────────────────────────────────────────────

function Section({ title, children, accent = "blue" }: { title: string; children: React.ReactNode; accent?: "blue"|"violet"|"amber"|"teal" }) {
  const bar = { blue: "bg-blue-500", violet: "bg-violet-500", amber: "bg-amber-400", teal: "bg-teal-500" }[accent];
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-white/5">
        <span className={`w-0.5 h-3.5 rounded-full ${bar}`}></span>
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${className}`}>{children}</span>;
}

function TrendArrow({ trend }: { trend: "up"|"neutral"|"down" }) {
  return trend === "up" ? <span className="text-emerald-400 text-xs font-bold">↑</span>
    : trend === "down"  ? <span className="text-red-400 text-xs font-bold">↓</span>
    : <span className="text-slate-500 text-xs">→</span>;
}

function DonutChart({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  let angle = -90;
  const r = 56, cx = 70, cy = 70;
  const slices = catKeys.map((key, i) => {
    const sweep = ((counts[key] || 0) / total) * 360;
    const start = angle; angle += sweep;
    const toR = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toR(start)), y1 = cy + r * Math.sin(toR(start));
    const x2 = cx + r * Math.cos(toR(angle)), y2 = cy + r * Math.sin(toR(angle));
    return { key, path: `M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}Z`, color: catColors[i] };
  });
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      {slices.map(s => <path key={s.key} d={s.path} fill={s.color} />)}
      <circle cx={cx} cy={cy} r={36} fill="#1a1d27" />
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#64748b" fontSize="10">total</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#f1f5f9" fontSize="20" fontWeight="700">{total}</text>
    </svg>
  );
}

// ─── Task Table ───────────────────────────────────────────────────────────────

function TaskRow({ task, onCycleStatus, onCyclePriority, onStartEditDue, editingDue, dueInput, setDueInput, onSaveDue }: {
  task: Task; onCycleStatus: (id: number) => void; onCyclePriority: (id: number, e: React.MouseEvent) => void;
  onStartEditDue: (id: number, cur: string, e: React.MouseEvent) => void;
  editingDue: number|null; dueInput: string; setDueInput: (v: string) => void; onSaveDue: (id: number) => void;
}) {
  return (
    <tr className={`border-t border-white/5 cursor-pointer group transition-colors ${task.status === "done" ? "opacity-40 hover:bg-white/[0.015]" : "hover:bg-white/[0.03]"}`}
      onClick={() => onCycleStatus(task.id)}>
      <td className="px-4 py-3 text-sm text-slate-200 group-hover:text-white transition-colors">{task.title}</td>
      <td className="px-3 py-3" onClick={e => onCyclePriority(task.id, e)}>
        <span className="inline-flex items-center gap-1 cursor-pointer select-none group/pill">
          <Pill className={priorityStyle[task.priority]}>{task.priority === "med" ? "Med" : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</Pill>
          <span className="text-[9px] text-slate-600 opacity-0 group-hover/pill:opacity-100 transition-opacity">↻</span>
        </span>
      </td>
      <td className="px-3 py-3" onClick={e => onStartEditDue(task.id, task.due, e)}>
        {editingDue === task.id ? (
          <input autoFocus className="bg-[#1a1d27] border border-blue-500 rounded px-1.5 py-0.5 text-white text-xs w-16 outline-none"
            value={dueInput} onChange={e => setDueInput(e.target.value)}
            onBlur={() => onSaveDue(task.id)} onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === "Enter") onSaveDue(task.id); e.stopPropagation(); }} />
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-500 text-xs cursor-pointer hover:text-slate-300 transition-colors group/date">
            {task.due}
            <svg className="w-2.5 h-2.5 opacity-0 group-hover/date:opacity-60 transition-opacity" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
              <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </td>
      <td className="px-3 py-3"><Pill className={statusStyle[task.status]}>{statusLabel[task.status]}</Pill></td>
    </tr>
  );
}

function EditableTaskTable({ tasks, setTasks, showFilter = false, accentColor = "blue" }: {
  tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; showFilter?: boolean; accentColor?: "blue"|"violet"|"amber"|"teal";
}) {
  const [filter, setFilter]             = useState<"all"|"high"|"inprogress"|"done">("all");
  const [addingTask, setAddingTask]     = useState(false);
  const [newTitle, setNewTitle]         = useState("");
  const [newPriority, setNewPriority]   = useState<Priority>("med");
  const [newDue, setNewDue]             = useState("");
  const [editingDue, setEditingDue]     = useState<number|null>(null);
  const [dueInput, setDueInput]         = useState("");
  const [collapsed, setCollapsed]       = useState<Set<string>>(new Set());

  const activeBg = { blue: "bg-blue-600 border-blue-600", violet: "bg-violet-600 border-violet-600", teal: "bg-teal-600 border-teal-600", amber: "bg-amber-500 border-amber-500" }[accentColor];

  const cycleStatus   = (id: number) => setTasks(t => t.map(x => x.id === id ? { ...x, status: statusCycle[x.status] } : x));
  const cyclePriority = (id: number, e: React.MouseEvent) => { e.stopPropagation(); setTasks(t => t.map(x => x.id === id ? { ...x, priority: priorityCycle[x.priority] } : x)); };
  const startEditDue  = (id: number, cur: string, e: React.MouseEvent) => { e.stopPropagation(); setEditingDue(id); setDueInput(cur === "—" ? "" : cur); };
  const saveDue       = (id: number) => { setTasks(t => t.map(x => x.id === id ? { ...x, due: dueInput.trim() || "—" } : x)); setEditingDue(null); };
  const addTask       = () => { if (!newTitle.trim()) return; setTasks(t => [...t, { id: Date.now(), title: newTitle.trim(), priority: newPriority, due: newDue.trim() || "—", status: "todo" }]); setNewTitle(""); setNewDue(""); setNewPriority("med"); setAddingTask(false); };
  const toggleGroup   = (g: string) => setCollapsed(p => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n; });

  const filtered    = tasks.filter(t => filter === "high" ? t.priority === "high" : filter === "inprogress" ? t.status === "inprogress" : filter === "done" ? t.status === "done" : true);
  const active      = filtered.filter(t => t.status !== "done");
  const done        = filtered.filter(t => t.status === "done");
  const groups      = [...new Set(active.map(t => t.group || ""))].filter(Boolean) as string[];
  const hasGroups   = groups.length > 1;
  const rowProps    = { editingDue, dueInput, setDueInput, onCycleStatus: cycleStatus, onCyclePriority: cyclePriority, onStartEditDue: startEditDue, onSaveDue: saveDue };

  return (
    <>
      {showFilter && (
        <div className="flex gap-1.5 mb-3">
          {(["all","high","inprogress","done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${filter === f ? `${activeBg} text-white` : "bg-transparent text-slate-500 border-white/10 hover:text-slate-300"}`}>
              {f === "all" ? "All" : f === "high" ? "High Priority" : f === "inprogress" ? "In Progress" : "Done"}
            </button>
          ))}
        </div>
      )}
      <div className="rounded-lg border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#252836] text-[10px] uppercase tracking-widest text-slate-600">
              <th className="text-left px-4 py-2.5 font-medium">Task</th>
              <th className="text-left px-3 py-2.5 font-medium w-24">Priority</th>
              <th className="text-left px-3 py-2.5 font-medium w-20">Due</th>
              <th className="text-left px-3 py-2.5 font-medium w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {hasGroups ? groups.map(group => {
              const gt = active.filter(t => t.group === group);
              const col = collapsed.has(group);
              return (
                <>
                  <tr key={`g-${group}`} className="bg-[#1c1f2e] border-t border-white/5 cursor-pointer hover:bg-[#20233a] select-none" onClick={() => toggleGroup(group)}>
                    <td colSpan={4} className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{group}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-600">{gt.length} task{gt.length !== 1 ? "s" : ""}</span>
                          <span className="text-slate-600 text-xs">{col ? "▸" : "▾"}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {!col && gt.map(task => <TaskRow key={task.id} task={task} {...rowProps} />)}
                </>
              );
            }) : active.map(task => <TaskRow key={task.id} task={task} {...rowProps} />)}

            {done.length > 0 && (
              <>
                <tr className="border-t border-white/5 bg-[#181a26]">
                  <td colSpan={4} className="px-4 py-1.5">
                    <span className="text-[10px] text-slate-700 uppercase tracking-widest">Completed · {done.length}</span>
                  </td>
                </tr>
                {done.map(task => <TaskRow key={task.id} task={task} {...rowProps} />)}
              </>
            )}

            {addingTask ? (
              <tr className="border-t border-white/5 bg-[#1e2130]">
                <td className="px-4 py-2.5">
                  <input autoFocus placeholder="Task title…" className="bg-transparent outline-none text-sm text-slate-200 w-full placeholder:text-slate-600"
                    value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setAddingTask(false); }} />
                </td>
                <td className="px-3 py-2.5">
                  <select className="bg-[#252836] text-xs text-slate-300 border border-white/10 rounded px-1.5 py-0.5 outline-none" value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)}>
                    <option value="high">High</option><option value="med">Med</option><option value="low">Low</option>
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input placeholder="Jun 20" className="bg-[#1a1d27] border border-white/10 rounded px-1.5 py-0.5 text-xs text-slate-300 w-16 outline-none"
                    value={newDue} onChange={e => setNewDue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); }} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={addTask} className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">Add</button>
                    <button onClick={() => setAddingTask(false)} className="text-[11px] text-slate-600 hover:text-slate-400">Cancel</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr className="border-t border-white/5">
                <td colSpan={4} className="px-4 py-2.5">
                  <button onClick={() => setAddingTask(true)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    <span className="text-sm leading-none">+</span> Add task
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5">Click row to cycle status · Priority pill → change · Date → edit inline</p>
    </>
  );
}

// ─── Work Tab ─────────────────────────────────────────────────────────────────

function WorkTab() {
  const [tasks, setTasks]           = useState<Task[]>(initWorkTasks);
  const [kpis, setKpis]             = useState<KPI[]>(initKPIs);
  const [editingKpi, setEditingKpi] = useState<number|null>(null);
  const [kpiInput, setKpiInput]     = useState("");

  return (
    <div>
      <Section title="My To-Dos" accent="blue">
        <EditableTaskTable tasks={tasks} setTasks={setTasks} showFilter accentColor="blue" />
      </Section>

      <Section title="Team Standup — Week of Jun 9" accent="blue">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          <span className="text-xs text-slate-600">Synced from Notion · Fill by Monday 9AM</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {standupTeam.map(m => (
            <div key={m.name} className="bg-[#252836] rounded-lg p-4 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{m.name}</div>
                  <div className="text-xs text-slate-600">{m.role}</div>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${m.fresh ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                  <span className="text-[10px] text-slate-600">{m.fresh ? "current" : "stale"}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs"><span className="text-slate-600">Focus · </span><span className="text-slate-300">{m.focus}</span></div>
                <div className="text-xs"><span className="text-slate-600">Blockers · </span><span className="text-slate-400">{m.blockers}</span></div>
              </div>
              <div className="text-[10px] text-slate-700 mt-2 pt-2 border-t border-white/5">Updated {m.updated}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Design Tracker" accent="blue">
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#252836] text-[10px] uppercase tracking-widest text-slate-600">
                <th className="text-left px-4 py-2.5 font-medium">Asset</th>
                <th className="text-left px-3 py-2.5 font-medium w-20">Type</th>
                <th className="text-left px-3 py-2.5 font-medium w-28">Status</th>
                <th className="text-left px-3 py-2.5 font-medium w-24">Briefed By</th>
                <th className="text-left px-3 py-2.5 font-medium w-20">Due</th>
              </tr>
            </thead>
            <tbody>
              {initDesignAssets.map(a => (
                <tr key={a.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-200">{a.name}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{a.type}</td>
                  <td className="px-3 py-3"><Pill className={designStatusStyle[a.status]}>{a.status}</Pill></td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{a.briefedBy}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{a.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">Source: Notion Design Tracker · synced Jun 9</p>
      </Section>

      <Section title="KPI Targets — H1 2026" accent="blue">
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(kpi => {
            const pct = Math.min(100, Math.round((kpi.current / kpi.target) * 100));
            const fmt = (v: number) => kpi.unit === "$M" ? `$${v}M` : kpi.unit === "%" ? `${v}%` : kpi.unit === "$" ? `$${v.toLocaleString()}` : v.toLocaleString();
            return (
              <div key={kpi.id} className="bg-[#252836] rounded-lg p-4 border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-slate-400 leading-snug pr-2">{kpi.label}</span>
                  <TrendArrow trend={kpi.trend} />
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  {editingKpi === kpi.id ? (
                    <input autoFocus className="bg-[#1a1d27] border border-blue-500 rounded px-1.5 py-0.5 text-white text-lg w-24 outline-none font-bold"
                      value={kpiInput} onChange={e => setKpiInput(e.target.value)}
                      onBlur={() => { const v = parseFloat(kpiInput); if (!isNaN(v)) setKpis(k => k.map(x => x.id === kpi.id ? { ...x, current: v } : x)); setEditingKpi(null); }}
                      onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
                  ) : (
                    <span className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => { setEditingKpi(kpi.id); setKpiInput(String(kpi.current)); }}>{fmt(kpi.current)}</span>
                  )}
                  <span className="text-slate-600 text-xs">/ {fmt(kpi.target)}</span>
                </div>
                <Progress value={pct} className="h-1.5 bg-slate-700/80 mb-1" />
                <div className="text-[11px] text-slate-600">{pct}% of target</div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">Click any number to update the current value</p>
      </Section>
    </div>
  );
}

// ─── Questing Tab ─────────────────────────────────────────────────────────────

function QuestingTab() {
  const [qtasks, setQtasks] = useState<Task[]>(initQuestingTasks);
  const counts = catKeys.reduce((acc, k) => { acc[k] = publishedArticles.filter(a => a.category === k).length; return acc; }, {} as Record<string, number>);
  const total  = publishedArticles.length;

  return (
    <div>
      <Section title="Article Mix Tracker" accent="violet">
        <div className="flex gap-8 items-start mb-5">
          <DonutChart counts={counts} />
          <div className="flex-1 space-y-2.5 pt-1">
            {catKeys.map((key, i) => {
              const actual = total > 0 ? Math.round(((counts[key] || 0) / total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: catColors[i] }}></span>
                  <span className="text-xs text-slate-400 w-20">{key}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${actual}%`, background: catColors[i] }}></div>
                  </div>
                  <span className="text-[11px] w-32 text-right">
                    <span className="text-slate-300">{actual}%</span>
                    <span className="text-slate-700"> · target {categoryTargets[key]}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#252836] text-[10px] uppercase tracking-widest text-slate-600">
                <th className="text-left px-4 py-2.5 font-medium">Title</th>
                <th className="text-left px-3 py-2.5 font-medium w-28">Category</th>
                <th className="text-left px-3 py-2.5 font-medium w-24">Date</th>
                <th className="text-left px-3 py-2.5 font-medium w-36">Platform</th>
              </tr>
            </thead>
            <tbody>
              {publishedArticles.map(a => (
                <tr key={a.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-200">{a.title}</td>
                  <td className="px-3 py-3 text-slate-500 text-[11px]">{a.category}</td>
                  <td className="px-3 py-3 text-slate-600 text-xs">{a.date}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{a.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Article Pipeline" accent="violet">
        <div className="grid grid-cols-5 gap-2">
          {(["Ideas","Researching","Writing","Editing","Published"] as const).map(stage => {
            const items = initPipeline.filter(p => p.stage === stage);
            return (
              <div key={stage} className="bg-[#252836] rounded-lg p-3 border border-white/5 min-h-[120px]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{stage}</span>
                  <span className="text-[10px] bg-slate-700 text-slate-500 rounded-full w-4 h-4 flex items-center justify-center">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="bg-[#1a1d27] rounded p-2 border border-white/5">
                      <div className="text-[11px] text-slate-300 leading-snug mb-1.5">{item.title}</div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-700">{item.category}</span>
                        <span className="text-[10px] text-slate-700">{item.targetDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Newsletter Tasks" accent="violet">
        <EditableTaskTable tasks={qtasks} setTasks={setQtasks} showFilter accentColor="violet" />
      </Section>
    </div>
  );
}

// ─── Yellow Tab ───────────────────────────────────────────────────────────────

function YellowTab() {
  const [btasks, setBtasks] = useState<Task[]>(initBookTasks);
  const done  = initInterviews.filter(i => i.status === "Done" || i.status === "Transcribed").length;
  const total = initInterviews.length;
  const pct   = Math.round((done / total) * 100);

  return (
    <div>
      <Section title="Interview Tracker" accent="amber">
        <div className="flex items-center gap-4 mb-4">
          <div><span className="text-3xl font-bold text-white">{done}</span><span className="text-slate-600 text-lg"> / {total}</span></div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-1.5">interviews complete</div>
            <div className="bg-slate-800 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }}></div></div>
          </div>
          <span className="text-2xl font-bold text-amber-400">{pct}%</span>
        </div>
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#252836] text-[10px] uppercase tracking-widest text-slate-600">
                <th className="text-left px-4 py-2.5 font-medium">Name</th>
                <th className="text-left px-3 py-2.5 font-medium w-32">Organization</th>
                <th className="text-left px-3 py-2.5 font-medium w-32">Role</th>
                <th className="text-left px-3 py-2.5 font-medium w-28">Status</th>
                <th className="text-left px-3 py-2.5 font-medium">Key Themes</th>
              </tr>
            </thead>
            <tbody>
              {initInterviews.map(iv => (
                <tr key={iv.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-200 font-medium">{iv.name}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{iv.org}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{iv.role}</td>
                  <td className="px-3 py-3"><Pill className={interviewStatusStyle[iv.status]}>{iv.status}</Pill></td>
                  <td className="px-3 py-3 text-slate-600 text-xs">{iv.themes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Outline & Chapter Progress" accent="amber">
        <div className="space-y-2">
          {initChapters.map(ch => (
            <div key={ch.id} className="bg-[#252836] rounded-lg px-4 py-3 border border-white/5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="text-sm text-slate-200">{ch.title}</div>
                  {ch.notes && <div className="text-[11px] text-slate-600 mt-0.5">{ch.notes}</div>}
                </div>
                <Pill className={chapterStatusStyle[ch.status]}>{ch.status}</Pill>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-800 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${ch.progress}%` }}></div></div>
                <span className="text-[11px] text-slate-600 w-8 text-right">{ch.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Book Tasks" accent="amber">
        <EditableTaskTable tasks={btasks} setTasks={setBtasks} showFilter accentColor="amber" />
      </Section>
    </div>
  );
}

// ─── Side Quests Tab ──────────────────────────────────────────────────────────

function ConsultingTab() {
  const [tasks, setTasks] = useState<Task[]>(initConsultingTasks);
  return (
    <div>
      <Section title="My To-Dos" accent="teal">
        <EditableTaskTable tasks={tasks} setTasks={setTasks} showFilter accentColor="teal" />
      </Section>
      <Section title="Client KPIs" accent="teal">
        <div className="grid grid-cols-3 gap-3">
          {clientKPIs.map(c => {
            const pct = Math.min(100, Math.round((c.current / c.target) * 100));
            const fmt = (v: number) => c.unit === "$" ? `$${v.toLocaleString()}` : `${v}${c.unit}`;
            return (
              <div key={c.id} className="bg-[#252836] rounded-lg p-4 border border-white/5">
                <div className="text-xs text-slate-600 mb-0.5">{c.client}</div>
                <div className="text-sm font-medium text-slate-300 mb-3">{c.metric}</div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-bold text-white">{fmt(c.current)}</span>
                  <span className="text-slate-600 text-xs">/ {fmt(c.target)}</span>
                </div>
                <Progress value={pct} className="h-1.5 bg-slate-700/80 mb-1" />
                <div className="text-[11px] text-slate-600">{pct}% of target</div>
              </div>
            );
          })}
        </div>
      </Section>
      <Section title="Project Status" accent="teal">
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#252836] text-[10px] uppercase tracking-widest text-slate-600">
                <th className="text-left px-4 py-2.5 font-medium">Project</th>
                <th className="text-left px-3 py-2.5 font-medium w-28">Client</th>
                <th className="text-left px-3 py-2.5 font-medium w-24">Status</th>
                <th className="text-left px-3 py-2.5 font-medium">Next Milestone</th>
                <th className="text-left px-3 py-2.5 font-medium w-20">Due</th>
              </tr>
            </thead>
            <tbody>
              {initProjects.map(p => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-200 font-medium">{p.name}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{p.client}</td>
                  <td className="px-3 py-3"><Pill className={projectStatusStyle[p.status]}>{p.status}</Pill></td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{p.nextMilestone}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{p.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ─── Journal Tab ──────────────────────────────────────────────────────────────

type EntryProject = "SB" | "Questing" | "Yellow" | "Side Quests" | "General";
type EntryType    = "Win" | "Decision" | "Blocker" | "Idea" | "Reflection";

interface JournalEntry {
  id: string;
  date: string;
  project: EntryProject;
  type: EntryType;
  contentWorthy: boolean;
  text: string;
}

const DEEPGRAM_KEY = "e0fa63b106dbf1488a9c5e58b457af8160e63c60";
const GH_TOKEN = "REDACTED_GITHUB_TOKEN";
const GH_REPO  = "Danieltadeyemi/my-plate-dashboard";
const GH_FILE  = "journal.json";
const GH_API   = `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`;

async function ghRead(): Promise<{ entries: JournalEntry[]; sha: string }> {
  const res  = await fetch(GH_API, { headers: { Authorization: `token ${GH_TOKEN}` } });
  const data = await res.json();
  const entries: JournalEntry[] = JSON.parse(atob(data.content.replace(/\n/g, "")));
  return { entries, sha: data.sha };
}

async function ghWrite(entries: JournalEntry[], sha: string, msg: string) {
  await fetch(GH_API, {
    method: "PUT",
    headers: { Authorization: `token ${GH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg, content: btoa(JSON.stringify(entries, null, 2)), sha }),
  });
}

const entryTypeStyle: Record<EntryType, string> = {
  Win:        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  Decision:   "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  Blocker:    "bg-red-500/15 text-red-400 border border-red-500/25",
  Idea:       "bg-violet-500/15 text-violet-400 border border-violet-500/25",
  Reflection: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
};
const projectStyle: Record<EntryProject, string> = {
  SB:           "text-blue-400",
  Questing:     "text-violet-400",
  Yellow:       "text-amber-400",
  "Side Quests":"text-teal-400",
  General:      "text-slate-400",
};


function JournalEntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LENGTH = 180;
  const isLong = entry.text.length > PREVIEW_LENGTH;

  return (
    <div className="bg-[#252836] rounded-lg p-4 border border-white/5 group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Pill className={entryTypeStyle[entry.type]}>{entry.type}</Pill>
          <span className={`text-[11px] font-medium ${projectStyle[entry.project]}`}>{entry.project}</span>
          {entry.contentWorthy && (
            <span className="text-[11px] text-rose-400 border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 rounded">✦ content</span>
          )}
        </div>
        <button onClick={() => onDelete(entry.id)}
          className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs flex-shrink-0">✕</button>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">
        {expanded || !isLong ? entry.text : entry.text.slice(0, PREVIEW_LENGTH).trimEnd() + "…"}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)}
          className="mt-2 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          {expanded ? "Show less ▴" : "Read more ▾"}
        </button>
      )}
    </div>
  );
}

function JournalTab() {
  const [entries, setEntries]         = useState<JournalEntry[]>([]);
  const [sha, setSha]                 = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [transcript, setTranscript]   = useState("");
  const [listening, setListening]     = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [project, setProject]         = useState<EntryProject>("SB");
  const [entryType, setEntryType]     = useState<EntryType>("Reflection");
  const [contentWorthy, setContentWorthy] = useState(false);
  const [filterProject, setFilterProject] = useState<EntryProject|"All">("All");
  const [filterType, setFilterType]   = useState<EntryType|"All">("All");
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const chunksRef        = useRef<Blob[]>([]);

  // Load from GitHub on mount
  useEffect(() => {
    ghRead().then(({ entries: e, sha: s }) => { setEntries(e); setSha(s); setLoading(false); })
            .catch(() => { setLoading(false); toast("Couldn't load journal — check connection."); });
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setTranscribing(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const res  = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true", {
            method: "POST",
            headers: { Authorization: `Token ${DEEPGRAM_KEY}`, "Content-Type": "audio/webm" },
            body: blob,
          });
          const data = await res.json();
          const text = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
          setTranscript(prev => (prev + " " + text).trim());
        } catch {
          toast("Transcription failed — check your connection.");
        } finally {
          setTranscribing(false);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setListening(true);
    } catch {
      toast("Microphone access denied. Please allow microphone in your browser.");
    }
  };

  const stopListening = () => {
    mediaRecorderRef.current?.stop();
    setListening(false);
  };

  const saveEntry = async () => {
    if (!transcript.trim() || saving) return;
    setSaving(true);
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      project, type: entryType, contentWorthy,
      text: transcript.trim(),
    };
    try {
      // Re-fetch latest SHA before writing to avoid conflicts
      const { entries: latest, sha: latestSha } = await ghRead();
      const updated = [entry, ...latest];
      await ghWrite(updated, latestSha, `Journal: ${entryType} · ${project} · ${entry.date}`);
      setEntries(updated);
      setSha(latestSha);
      setTranscript("");
      setContentWorthy(false);
      toast("Entry saved", { description: `${entryType} · ${project}` });
    } catch {
      toast("Save failed — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { entries: latest, sha: latestSha } = await ghRead();
      const updated = latest.filter(e => e.id !== id);
      await ghWrite(updated, latestSha, `Journal: delete entry ${id}`);
      setEntries(updated);
      setSha(latestSha);
    } catch {
      toast("Delete failed — check your connection.");
    }
  };

  const filtered = entries.filter(e =>
    (filterProject === "All" || e.project === filterProject) &&
    (filterType === "All" || e.type === filterType)
  );

  // Group by date
  const byDate = filtered.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <div>
      <Section title="New Entry" accent="blue">
        {/* Record bar */}
        <div className={`rounded-lg border transition-colors p-4 mb-3 ${listening ? "border-rose-500/40 bg-rose-500/5" : "border-white/5 bg-[#252836]"}`}>
          <div className="flex items-start gap-3">
            <button
              onClick={listening ? stopListening : startListening}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 animate-pulse"
                  : "bg-[#1a1d27] border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10"
              }`}
              title={listening ? "Stop recording" : "Start voice dictation"}
            >
              <svg className={`w-4 h-4 ${listening ? "text-white" : "text-slate-400"}`} fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/>
                <path d="M4.5 8.5a.5.5 0 0 0-1 0A4.5 4.5 0 0 0 7.5 13v1.5h-2a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-2V13a4.5 4.5 0 0 0 4-4.5.5.5 0 0 0-1 0A3.5 3.5 0 0 1 8 12a3.5 3.5 0 0 1-3.5-3.5z"/>
              </svg>
            </button>
            <div className="flex-1">
              {listening && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-xs text-rose-400 font-medium">Recording… click mic to stop</span>
                </div>
              )}
              {transcribing && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-xs text-amber-400 font-medium">Transcribing…</span>
                </div>
              )}
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Click the mic and start talking, or type here…"
                rows={4}
                className="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 uppercase tracking-wider">Project</span>
            <select value={project} onChange={e => setProject(e.target.value as EntryProject)}
              className="bg-[#252836] text-xs text-slate-300 border border-white/10 rounded px-2 py-1 outline-none">
              {(["SB","Questing","Yellow","Side Quests","General"] as EntryProject[]).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 uppercase tracking-wider">Type</span>
            <select value={entryType} onChange={e => setEntryType(e.target.value as EntryType)}
              className="bg-[#252836] text-xs text-slate-300 border border-white/10 rounded px-2 py-1 outline-none">
              {(["Win","Decision","Blocker","Idea","Reflection"] as EntryType[]).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={contentWorthy} onChange={e => setContentWorthy(e.target.checked)}
              className="rounded" />
            <span className="text-xs text-slate-500">Content-worthy</span>
          </label>
          <button onClick={saveEntry} disabled={!transcript.trim() || saving}
            className="ml-auto px-4 py-1.5 rounded text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            {saving ? "Saving…" : "Save Entry"}
          </button>
        </div>
      </Section>

      <Section title={`Log · ${entries.length} entries`} accent="blue">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-1.5">
            {(["All","SB","Questing","Yellow","Side Quests","General"] as (EntryProject|"All")[]).map(p => (
              <button key={p} onClick={() => setFilterProject(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${filterProject === p ? "bg-rose-600 border-rose-600 text-white" : "bg-transparent text-slate-500 border-white/10 hover:text-slate-300"}`}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["All","Win","Decision","Blocker","Idea","Reflection"] as (EntryType|"All")[]).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${filterType === t ? "bg-rose-600 border-rose-600 text-white" : "bg-transparent text-slate-500 border-white/10 hover:text-slate-300"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600 text-sm flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse"></span>
            Loading journal…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm">
            {entries.length === 0 ? "No entries yet. Hit the mic and start talking." : "No entries match this filter."}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byDate).map(([date, dayEntries]) => (
              <div key={date}>
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">{date}</div>
                <div className="space-y-2">
                  {dayEntries.map(entry => <JournalEntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const handleRefresh = () => {
    toast("Refreshing dashboard…", { description: "Loading the latest version.", duration: 1500 });
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      <Toaster position="top-right" theme="dark" />
      <div className="sticky top-0 z-20 bg-[#0f1117]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-sm font-bold text-white tracking-tight">My Plate</h1>
            <span className="text-xs text-slate-600">June 9, 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 border border-white/8 rounded px-2 py-1">last updated today</span>
            <button onClick={handleRefresh} className="flex items-center gap-1.5 text-xs text-slate-400 border border-white/10 bg-[#1a1d27] hover:bg-[#252836] px-3 py-1.5 rounded transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2A6 6 0 1 0 13 8" /><path d="M13 2v3h-3" strokeLinejoin="round" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <Tabs defaultValue="work">
          <TabsList className="bg-[#1a1d27] border border-white/5 rounded-lg p-1 mb-6 w-full grid grid-cols-5">
            <TabsTrigger value="work"       className="text-xs font-medium text-slate-500 data-[state=active]:bg-blue-600   data-[state=active]:text-white rounded-md transition-all">SB</TabsTrigger>
            <TabsTrigger value="questing"   className="text-xs font-medium text-slate-500 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-md transition-all">Questing</TabsTrigger>
            <TabsTrigger value="yellow"     className="text-xs font-medium text-slate-500 data-[state=active]:bg-amber-500  data-[state=active]:text-black rounded-md transition-all">Yellow</TabsTrigger>
            <TabsTrigger value="consulting" className="text-xs font-medium text-slate-500 data-[state=active]:bg-teal-600   data-[state=active]:text-white rounded-md transition-all">Side Quests</TabsTrigger>
            <TabsTrigger value="journal"    className="text-xs font-medium text-slate-500 data-[state=active]:bg-rose-600   data-[state=active]:text-white rounded-md transition-all">Journal</TabsTrigger>
          </TabsList>
          <TabsContent value="work"       className="mt-0"><WorkTab /></TabsContent>
          <TabsContent value="questing"   className="mt-0"><QuestingTab /></TabsContent>
          <TabsContent value="yellow"     className="mt-0"><YellowTab /></TabsContent>
          <TabsContent value="consulting" className="mt-0"><ConsultingTab /></TabsContent>
          <TabsContent value="journal"    className="mt-0"><JournalTab /></TabsContent>
        </Tabs>
      </div>
      <div className="border-t border-white/5 mt-4">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between">
          <span className="text-[11px] text-slate-600">My Plate · Updated June 9, 2026</span>
          <span className="text-[11px] text-slate-600">SB · Questing · Yellow · Side Quests · Journal</span>
        </div>
      </div>
    </div>
  );
}
