import { useMemo, useState, type ReactNode, type ChangeEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageSquare,
  Minus,
  PackageCheck,
  Pill,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type MedicineType = 'OTC' | 'prescription';
type OrderStatus = 'Needs review' | 'Approved' | 'Query sent' | 'Rejected';
type Role = 'patient' | 'pharmacist' | null;

type Medicine = {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  price: number;
  type: MedicineType;
  description: string;
  stock: number;
};
type CartItem = { medicine: Medicine; quantity: number };
type Pharmacy = {
  id: string;
  name: string;
  address: string;
  distance: string;
  openUntil: string;
  stockStatus: string;
  eta: string;
};
type ExtractedMedicine = {
  medicineId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  genericAlternative: string;
  savings: number;
  matchConfidence: number;
};
type Order = {
  id: string;
  patientName: string;
  patientInitials: string;
  createdAt: string;
  type: MedicineType;
  items: CartItem[];
  total: number;
  pharmacy: Pharmacy;
  status: OrderStatus;
  prescriptionImage?: string;
  extractedText?: string;
};

const medicines: Medicine[] = [
  { id: 'm1', name: 'Cetirizine 10 mg', genericName: 'Cetirizine hydrochloride', strength: '10 mg', form: '30 tablets', price: 8.49, type: 'OTC', description: '24-hour non-drowsy allergy relief', stock: 42 },
  { id: 'm2', name: 'Paracetamol 500 mg', genericName: 'Acetaminophen', strength: '500 mg', form: '50 caplets', price: 6.25, type: 'OTC', description: 'Fast relief for pain and fever', stock: 67 },
  { id: 'm3', name: 'Vitamin D3 1000 IU', genericName: 'Cholecalciferol', strength: '1000 IU', form: '90 softgels', price: 11.9, type: 'OTC', description: 'Daily support for bones and immunity', stock: 18 },
  { id: 'm4', name: 'Amoxicillin 500 mg', genericName: 'Amoxicillin', strength: '500 mg', form: '21 capsules', price: 18.75, type: 'prescription', description: 'Antibiotic for bacterial infections', stock: 12 },
  { id: 'm5', name: 'Lisinopril 10 mg', genericName: 'Lisinopril', strength: '10 mg', form: '30 tablets', price: 13.4, type: 'prescription', description: 'Blood pressure maintenance medication', stock: 24 },
  { id: 'm6', name: 'Metformin 500 mg', genericName: 'Metformin hydrochloride', strength: '500 mg', form: '60 tablets', price: 15.8, type: 'prescription', description: 'Blood sugar management support', stock: 31 },
  { id: 'm7', name: 'Omeprazole 20 mg', genericName: 'Omeprazole', strength: '20 mg', form: '28 capsules', price: 12.6, type: 'OTC', description: 'Heartburn and acid reflux relief', stock: 29 },
  { id: 'm8', name: 'Hydrocortisone 1%', genericName: 'Hydrocortisone', strength: '1%', form: '15 g cream', price: 9.25, type: 'OTC', description: 'Soothes minor skin irritation', stock: 15 },
  { id: 'm9', name: 'Pantoprazole 40 mg', genericName: 'Pantoprazole sodium', strength: '40 mg', form: '30 tablets', price: 14.2, type: 'prescription', description: 'Reduces acid and supports reflux relief', stock: 21 },
  { id: 'm10', name: 'Azithromycin 250 mg', genericName: 'Azithromycin', strength: '250 mg', form: '6 tablets', price: 22.4, type: 'prescription', description: 'Antibiotic prescribed for bacterial infections', stock: 9 },
  { id: 'm11', name: 'Ibuprofen 200 mg', genericName: 'Ibuprofen', strength: '200 mg', form: '50 tablets', price: 7.15, type: 'OTC', description: 'Temporary relief for aches and inflammation', stock: 54 },
  { id: 'm12', name: 'Dextromethorphan Cough Syrup', genericName: 'Dextromethorphan hydrobromide', strength: '15 mg / 5 mL', form: '120 mL bottle', price: 10.8, type: 'OTC', description: 'Night-time relief for dry coughs', stock: 26 },
  { id: 'm13', name: 'Amlodipine 5 mg', genericName: 'Amlodipine besylate', strength: '5 mg', form: '30 tablets', price: 12.9, type: 'prescription', description: 'Daily blood pressure maintenance medication', stock: 17 },
  { id: 'm14', name: 'Oral Rehydration Salts', genericName: 'Electrolyte solution', strength: '20.5 g sachet', form: '10 sachets', price: 5.6, type: 'OTC', description: 'Replenishes fluids and electrolytes', stock: 38 },
];

const pharmacies: Pharmacy[] = [
  { id: 'p1', name: 'Harbor Pharmacy', address: '142 Harbor Street', distance: '0.8 mi', openUntil: '9:00 PM', stockStatus: 'All items in stock', eta: '25–35 min' },
  { id: 'p2', name: 'Northstar Wellness', address: '88 Alder Avenue', distance: '1.4 mi', openUntil: '8:00 PM', stockStatus: '1 item limited', eta: '35–45 min' },
  { id: 'p3', name: 'Cedar Care Pharmacy', address: '307 Cedar Road', distance: '2.1 mi', openUntil: '10:00 PM', stockStatus: 'All items in stock', eta: '45–55 min' },
];

const startingOrders: Order[] = [
  {
    id: 'MF-1048', patientName: 'Jordan Lee', patientInitials: 'JL', createdAt: 'Today, 9:42 AM', type: 'prescription',
    items: [{ medicine: medicines[3], quantity: 1 }, { medicine: medicines[4], quantity: 1 }], total: 32.15, pharmacy: pharmacies[0], status: 'Needs review',
    prescriptionImage: 'Prescription scan • uploaded 9:41 AM', extractedText: 'Amoxicillin 500 mg — take one capsule three times daily for 7 days.\nLisinopril 10 mg — take one tablet once daily.',
  },
  {
    id: 'MF-1047', patientName: 'Maya Patel', patientInitials: 'MP', createdAt: 'Today, 9:28 AM', type: 'OTC',
    items: [{ medicine: medicines[0], quantity: 1 }, { medicine: medicines[6], quantity: 2 }], total: 33.69, pharmacy: pharmacies[1], status: 'Needs review',
  },
  {
    id: 'MF-1046', patientName: 'Sam Rivera', patientInitials: 'SR', createdAt: 'Today, 8:55 AM', type: 'prescription',
    items: [{ medicine: medicines[5], quantity: 1 }], total: 15.8, pharmacy: pharmacies[2], status: 'Needs review',
    prescriptionImage: 'Prescription scan • uploaded 8:54 AM', extractedText: 'Metformin 500 mg — take one tablet with breakfast and dinner.',
  },
  {
    id: 'MF-1045', patientName: 'Priya Shah', patientInitials: 'PS', createdAt: 'Yesterday, 6:18 PM', type: 'OTC',
    items: [{ medicine: medicines[1], quantity: 2 }], total: 12.5, pharmacy: pharmacies[0], status: 'Approved',
  },
];

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-mediflow">
      <div className={`grid size-9 place-items-center rounded-xl ${inverse ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
        <HeartPulse size={20} strokeWidth={2.4} />
      </div>
      <div className={`text-[17px] font-bold tracking-[-.04em] ${inverse ? 'text-sidebar-foreground' : 'text-foreground'}`}>
        Medi<span className="text-primary">Flow</span>
      </div>
    </div>
  );
}

function Badge({ children, tone = 'teal' }: { children: ReactNode; tone?: 'teal' | 'amber' | 'red' | 'slate' | 'green' }) {
  const tones = {
    teal: 'bg-primary/10 text-primary',
    amber: 'bg-accent/20 text-[#98631b]',
    red: 'bg-destructive/10 text-destructive',
    slate: 'bg-secondary text-muted-foreground',
    green: 'bg-[#dff2e7] text-[#27734d]',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[.04em] ${tones[tone]}`} data-testid="badge-status">{children}</span>;
}

function Button({ children, className = '', variant = 'primary', ...props }: { children: ReactNode; className?: string; variant?: 'primary' | 'outline' | 'ghost' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_5px_15px_hsl(var(--primary)/.18)]',
    outline: 'border border-border bg-card text-foreground hover:bg-secondary',
    ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  return <button className={`tap inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

function Modal({ title, eyebrow, children, onClose, wide = false }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#10393f]/45 p-4 backdrop-blur-[3px] animate-rise-in" role="dialog" aria-modal="true" data-testid="modal-overlay">
      <div className={`max-h-[92dvh] w-full overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_24px_80px_rgba(11,49,56,.25)] ${wide ? 'max-w-4xl' : 'max-w-xl'}`}>
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>{eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p>}<h2 className="display-font text-2xl font-semibold tracking-[-.03em]">{title}</h2></div>
          <button onClick={onClose} className="tap rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" data-testid="button-close-modal"><X size={18} /></button>
        </div>
        <div className="max-h-[calc(92dvh-92px)] overflow-y-auto scrollbar-thin p-6">{children}</div>
      </div>
    </div>
  );
}

function AppShell({ role, onLogout, children }: { role: 'patient' | 'pharmacist'; onLogout: () => void; children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const patient = role === 'patient';
  const nav = patient
    ? [{ label: 'Overview', icon: LayoutDashboard, path: '/patient' }, { label: 'My orders', icon: ClipboardList, path: '/patient#orders' }]
    : [{ label: 'Queue', icon: LayoutDashboard, path: '/pharmacist' }, { label: 'Fulfilled', icon: PackageCheck, path: '/pharmacist#fulfilled' }];
  return (
    <div className="noise flex min-h-[100dvh] bg-background">
      <aside className="hidden w-[242px] shrink-0 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground md:flex">
        <Logo inverse />
        <div className="mt-12 flex-1">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/50">{patient ? 'Your care space' : 'Pharmacy workspace'}</p>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = location === item.path || (item.path.includes('#') && location.startsWith(item.path.split('#')[0]));
              return <button key={item.label} onClick={() => setLocation(item.path.split('#')[0])} className={`tap flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'}`} data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}><Icon size={18} />{item.label}</button>;
            })}
          </nav>
          <div className="mt-10 rounded-2xl border border-sidebar-border bg-sidebar-foreground/5 p-4">
            <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"><ShieldCheck size={17} /></div>
            <p className="text-xs font-bold">Private by design</p>
            <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/55">Your health information stays protected in every step.</p>
          </div>
        </div>
        <button onClick={onLogout} className="tap flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/65 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground" data-testid="button-logout"><LogOut size={18} />Sign out</button>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border bg-card/75 px-5 py-4 backdrop-blur-md md:px-10">
          <div className="md:hidden"><Logo /></div>
          <div className="hidden text-sm text-muted-foreground md:block">{patient ? 'Tuesday, October 15, 2024' : 'Tuesday, October 15 · 10:02 AM'}</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-xs font-bold">{patient ? 'Alex Morgan' : 'Dr. Nina Okafor'}</p><p className="text-[11px] text-muted-foreground">{patient ? 'Patient account' : 'Lead pharmacist'}</p></div>
            <div className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{patient ? 'AM' : 'NO'}</div>
            <button onClick={onLogout} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden" data-testid="button-mobile-logout"><LogOut size={17} /></button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Home({ onLogin }: { onLogin: (role: 'patient' | 'pharmacist') => void }) {
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('mediflow-demo');
  return (
    <div className="noise flex min-h-[100dvh] bg-[#edf5f3]">
      <section className="relative hidden w-[43%] overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex lg:flex-col">
        <Logo inverse />
        <div className="relative z-10 mt-auto max-w-md pb-8">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-sidebar-primary"><span className="size-2 rounded-full bg-accent" /> Care, delivered clearly</p>
          <h1 className="display-font text-[clamp(3rem,5vw,5.6rem)] leading-[.93] tracking-[-.06em]">A calmer way to stay on top of your health.</h1>
          <p className="mt-7 max-w-sm text-sm leading-7 text-sidebar-foreground/65">One trusted place to find your medicines, understand your prescription, and get care moving.</p>
        </div>
        <div className="absolute -right-20 top-24 size-72 rounded-full border border-sidebar-primary/20" />
        <div className="absolute -right-8 top-40 size-72 rounded-full border border-sidebar-primary/15" />
        <div className="absolute bottom-12 right-16 grid size-24 rotate-12 place-items-center rounded-[2rem] bg-accent text-accent-foreground shadow-2xl"><HeartPulse size={43} strokeWidth={1.4} /></div>
      </section>
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[430px] animate-rise-in">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.17em] text-primary">Welcome back</p>
            <h2 className="display-font text-4xl font-semibold tracking-[-.04em] text-foreground">Your care, in motion.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in to continue where you left off.</p>
          </div>
          <div className="space-y-4">
            <label className="block"><span className="mb-2 block text-xs font-bold text-foreground">Email address</span><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-email" type="email" /></label>
            <label className="block"><div className="mb-2 flex justify-between"><span className="text-xs font-bold text-foreground">Password</span><button className="text-xs font-bold text-primary hover:underline" data-testid="button-forgot-password">Forgot password?</button></div><input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-password" type="password" /></label>
          </div>
          <div className="my-8 grid gap-3 sm:grid-cols-2">
            <Button onClick={() => onLogin('patient')} className="h-12" data-testid="button-login-patient"><UserRound size={17} />Login as patient</Button>
            <Button onClick={() => onLogin('pharmacist')} variant="outline" className="h-12" data-testid="button-login-pharmacist"><Stethoscope size={17} />Login as pharmacist</Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground"><LockKeyhole size={13} /> Demo mode · no personal data is stored</div>
          <p className="mt-12 text-center text-[11px] leading-5 text-muted-foreground/75">By continuing, you agree to MediFlow’s terms of care and privacy notice.</p>
        </div>
      </section>
    </div>
  );
}

function PrescriptionModal({ onClose, onAddToCart }: { onClose: () => void; onAddToCart: (items: ExtractedMedicine[]) => void }) {
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) setUploaded(true);
  };
  const analyze = () => {
    setAnalyzing(true);
    window.setTimeout(() => {
      const count = Math.floor(Math.random() * 3) + 2;
      const selectedMedicines = [...medicines]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
      const extracted = selectedMedicines.map((medicine) => ({
        medicineId: medicine.id,
        name: medicine.name,
        dosage: medicine.strength,
        frequency: medicine.type === 'OTC' ? 'As needed' : 'Once daily',
        duration: medicine.type === 'OTC' ? 'As directed' : '30 days',
        genericAlternative: medicine.genericName,
        savings: Number((medicine.price * (0.2 + Math.random() * 0.25)).toFixed(2)),
        matchConfidence: Math.floor(Math.random() * 15) + 85,
      }));
      setExtractedMedicines(extracted);
      setAnalyzing(false);
      setDone(true);
    }, 1400);
  };
  return (
    <Modal title={done ? 'Prescription understood' : 'Add a prescription'} eyebrow="Secure document upload" onClose={onClose}>
      {!done ? <div className="space-y-5">
        <div className="rounded-2xl bg-secondary/60 p-4"><div className="flex gap-3"><div className="mt-0.5 text-primary"><ShieldCheck size={19} /></div><p className="text-xs leading-5 text-muted-foreground">Upload a clear photo or PDF. MediFlow checks the details so your pharmacist can prepare the right medicines.</p></div></div>
        <label className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-9 text-center transition ${uploaded ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/40'}`} data-testid="dropzone-prescription">
          <input className="hidden" type="file" accept="image/*,.pdf" onChange={upload} data-testid="input-prescription" />
          <div className={`mb-3 grid size-12 place-items-center rounded-2xl ${uploaded ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}>{uploaded ? <Check size={23} /> : <Upload size={22} />}</div>
          <p className="text-sm font-bold">{uploaded ? 'Prescription ready to analyze' : 'Drop your prescription here'}</p>
          <p className="mt-1 text-xs text-muted-foreground">{uploaded ? 'One document selected' : 'or click to browse · JPG, PNG, PDF'}</p>
        </label>
        <Button className="w-full" disabled={!uploaded || analyzing} onClick={analyze} data-testid="button-analyze-prescription">{analyzing ? <><Activity size={17} className="animate-pulse" />Reading prescription…</> : <><Sparkles size={17} />Analyze prescription</>}</Button>
        <p className="text-center text-[11px] text-muted-foreground">Your document is used only to prepare this order.</p>
      </div> : <div className="space-y-5 animate-rise-in">
         <div className="flex items-center gap-3 rounded-2xl bg-[#e2f3e8] p-4 text-[#27734d]"><CheckCircle2 size={22} /><div><p className="text-sm font-bold">{extractedMedicines.length} medicines found</p><p className="text-xs opacity-80">Please review before adding them to your cart.</p></div></div>
         <div className="space-y-2">{extractedMedicines.map((item) => <div className="rounded-2xl border border-border p-4" key={item.medicineId}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{item.name} <span className="font-normal text-muted-foreground">{item.dosage}</span></p><p className="mt-1 text-xs text-muted-foreground">{item.frequency} · {item.duration}</p></div><Badge tone="green">{item.matchConfidence}% MATCH</Badge></div><div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2.5 text-xs"><span><span className="font-bold">Generic option:</span> {item.genericAlternative}</span><span className="font-bold text-[#27734d]">Save {money(item.savings)}</span></div></div>)}</div>
         <Button onClick={() => { onAddToCart(extractedMedicines); onClose(); }} className="w-full" data-testid="button-review-cart">Review medicines in cart <ArrowRight size={17} /></Button>
      </div>}
    </Modal>
  );
}

function PatientDashboard({ onLogout }: { onLogout: () => void }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState('');
  const [rxOpen, setRxOpen] = useState(false);
  const [rxUploaded, setRxUploaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [pharmacyId, setPharmacyId] = useState('p1');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [notice, setNotice] = useState('');
  const filtered = useMemo(() => query.trim() ? medicines.filter((m) => `${m.name} ${m.genericName}`.toLowerCase().includes(query.toLowerCase())) : medicines.slice(0, 6), [query]);
  const add = (medicine: Medicine) => {
    setCart((current) => current.some((item) => item.medicine.id === medicine.id) ? current.map((item) => item.medicine.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { medicine, quantity: 1 }]);
    setNotice(`${medicine.name} added to your basket`);
    window.setTimeout(() => setNotice(''), 2200);
  };
  const addExtractedToCart = (items: ExtractedMedicine[]) => {
    setCart((current) => items.reduce<CartItem[]>((next, item) => {
      const medicine = medicines.find((candidate) => candidate.id === item.medicineId);
      if (!medicine) return next;
      const existing = next.find((cartItem) => cartItem.medicine.id === medicine.id);
      if (existing) {
        return next.map((cartItem) => cartItem.medicine.id === medicine.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      }
      return [...next, { medicine, quantity: 1 }];
    }, [...current]));
    setRxUploaded(true);
    setCartOpen(true);
    setNotice(`${items.length} medicines added to your basket`);
    window.setTimeout(() => setNotice(''), 2200);
  };
  const adjust = (id: string, delta: number) => setCart((current) => current.flatMap((item) => item.medicine.id === id ? (item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []) : [item]));
  const hasRx = cart.some((item) => item.medicine.type === 'prescription');
  const subtotal = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const selectedPharmacy = pharmacies.find((p) => p.id === pharmacyId) ?? pharmacies[0];
  const placeOrder = () => { if (hasRx && !rxUploaded) { setRxOpen(true); return; } setOrderPlaced(true); };
  return (
    <AppShell role="patient" onLogout={onLogout}>
      <div className="mx-auto max-w-[1380px] px-5 py-7 md:px-10 md:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-primary">Good morning, Alex</p><h1 className="display-font text-4xl font-semibold tracking-[-.05em] md:text-5xl">What can we help with?</h1><p className="mt-3 text-sm text-muted-foreground">Find your medicine, upload a prescription, or check an order.</p></div>
          <button onClick={() => setCartOpen(true)} className="tap flex w-fit items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-[var(--shadow-sm)] hover:border-primary/40" data-testid="button-open-cart"><div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><ShoppingBag size={18} /></div><div><p className="text-xs font-bold">Your basket</p><p className="text-[11px] text-muted-foreground">{cart.length ? `${cart.length} item${cart.length > 1 ? 's' : ''} · ${money(subtotal)}` : 'Nothing added yet'}</p></div><ChevronRight size={16} className="ml-2 text-muted-foreground" /></button>
        </div>
        {notice && <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-sidebar px-4 py-3 text-xs font-bold text-sidebar-foreground shadow-xl animate-rise-in" data-testid="status-cart-notice"><Check size={15} className="text-sidebar-primary" />{notice}</div>}
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <section>
            <div className="relative mb-7"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-5 text-sm shadow-[var(--shadow-sm)] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Search by medicine or active ingredient" data-testid="input-medicine-search" /></div>
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              <button onClick={() => setRxOpen(true)} className="group flex items-center gap-4 rounded-2xl bg-primary p-5 text-left text-primary-foreground shadow-[0_10px_25px_hsl(var(--primary)/.18)]" data-testid="button-upload-prescription"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-foreground/15"><Upload size={21} /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold">Upload a prescription</p><p className="mt-1 text-xs text-primary-foreground/70">We’ll read it for you</p></div><ArrowRight size={18} className="transition group-hover:translate-x-1" /></button>
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/20 text-[#98631b]"><HeartPulse size={21} /></div><div><p className="text-sm font-bold">Care, on your terms</p><p className="mt-1 text-xs leading-5 text-muted-foreground">A pharmacist reviews every prescription order.</p></div></div>
            </div>
            <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-muted-foreground">{query ? 'Search results' : 'Popular today'}</p><h2 className="mt-1 text-xl font-bold tracking-[-.03em]">{query ? `${filtered.length} medicines found` : 'Essentials for your cabinet'}</h2></div>{query && <button onClick={() => setQuery('')} className="text-xs font-bold text-primary" data-testid="button-clear-search">Clear search</button>}</div>
            {filtered.length ? <div className="grid gap-3 md:grid-cols-2">{filtered.map((medicine, index) => <MedicineCard medicine={medicine} onAdd={add} key={medicine.id} delay={index % 3} />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center"><CircleAlert className="mx-auto text-muted-foreground" size={28} /><p className="mt-3 font-bold">No medicine matched that search</p><p className="mt-1 text-sm text-muted-foreground">Try the generic name or a shorter phrase.</p></div>}
          </section>
          <aside className="hidden xl:block"><CartPanel cart={cart} pharmacyId={pharmacyId} setPharmacyId={setPharmacyId} onAdjust={adjust} onPlaceOrder={placeOrder} hasRx={hasRx} rxUploaded={rxUploaded} subtotal={subtotal} selectedPharmacy={selectedPharmacy} /></aside>
        </div>
      </div>
      {cartOpen && <div className="fixed inset-0 z-30 bg-sidebar/30 backdrop-blur-sm xl:hidden" onClick={() => setCartOpen(false)}><div className="absolute bottom-0 right-0 top-0 w-full max-w-md overflow-y-auto bg-background p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="mb-5 flex justify-between"><h2 className="display-font text-2xl font-semibold">Your basket</h2><button onClick={() => setCartOpen(false)} className="rounded-lg p-2 hover:bg-secondary" data-testid="button-close-cart"><X size={19} /></button></div><CartPanel cart={cart} pharmacyId={pharmacyId} setPharmacyId={setPharmacyId} onAdjust={adjust} onPlaceOrder={placeOrder} hasRx={hasRx} rxUploaded={rxUploaded} subtotal={subtotal} selectedPharmacy={selectedPharmacy} /></div></div>}
      {rxOpen && <PrescriptionModal onClose={() => setRxOpen(false)} onAddToCart={addExtractedToCart} />}
      {orderPlaced && <Modal title="Order is on its way" eyebrow="Order confirmed" onClose={() => { setOrderPlaced(false); setCart([]); }}><div className="text-center"><div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#e2f3e8] text-[#27734d]"><PackageCheck size={32} /></div><p className="mt-5 text-sm leading-6 text-muted-foreground">Harbor Pharmacy is preparing your order. You’ll receive a notification when your courier is nearby.</p><div className="my-6 rounded-2xl bg-secondary/60 p-4 text-left"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated arrival</span><span className="font-bold">{selectedPharmacy.eta}</span></div><div className="mt-3 flex justify-between text-sm"><span className="text-muted-foreground">Order total</span><span className="font-bold">{money(subtotal)}</span></div></div><Button className="w-full" onClick={() => { setOrderPlaced(false); setCart([]); }} data-testid="button-done-order">Back to medicines</Button></div></Modal>}
    </AppShell>
  );
}

function MedicineCard({ medicine, onAdd, delay }: { medicine: Medicine; onAdd: (medicine: Medicine) => void; delay: number }) {
  return <article className={`card-lift animate-rise-in rounded-2xl border border-border bg-card p-4 ${delay ? `delay-${delay}` : ''}`} data-testid={`card-medicine-${medicine.id}`}><div className="mb-5 flex items-start justify-between"><div className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary"><Pill size={21} /></div><Badge tone={medicine.type === 'OTC' ? 'teal' : 'amber'}>{medicine.type === 'OTC' ? 'OTC' : 'Prescription Required'}</Badge></div><h3 className="text-sm font-bold">{medicine.name}</h3><p className="mt-1 text-xs text-muted-foreground">{medicine.description}</p><div className="mt-5 flex items-end justify-between"><div><p className="text-lg font-bold">{money(medicine.price)}</p><p className="text-[11px] text-muted-foreground">{medicine.form} · {medicine.stock} in stock</p></div><Button onClick={() => onAdd(medicine)} className="size-10 rounded-xl p-0" data-testid={`button-add-${medicine.id}`}><Plus size={18} /></Button></div></article>;
}

function CartPanel({ cart, pharmacyId, setPharmacyId, onAdjust, onPlaceOrder, hasRx, rxUploaded, subtotal, selectedPharmacy }: { cart: CartItem[]; pharmacyId: string; setPharmacyId: (id: string) => void; onAdjust: (id: string, delta: number) => void; onPlaceOrder: () => void; hasRx: boolean; rxUploaded: boolean; subtotal: number; selectedPharmacy: Pharmacy }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]"><div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-bold">Your basket</h2><Badge tone={cart.length ? 'teal' : 'slate'}>{cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}</Badge></div>{cart.length === 0 ? <div className="rounded-2xl bg-secondary/55 px-4 py-10 text-center"><ShoppingBag className="mx-auto text-primary/50" size={30} /><p className="mt-3 text-sm font-bold">Your basket is ready</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Add something from the catalogue to get started.</p></div> : <><div className="space-y-3">{cart.map((item) => <div className="flex items-center gap-3" key={item.medicine.id} data-testid={`cart-item-${item.medicine.id}`}><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Pill size={16} /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.medicine.name}</p><p className="text-[11px] text-muted-foreground">{money(item.medicine.price)} each</p></div><div className="flex items-center gap-1 rounded-lg bg-secondary p-1"><button onClick={() => onAdjust(item.medicine.id, -1)} className="grid size-6 place-items-center rounded-md hover:bg-card" data-testid={`button-decrease-${item.medicine.id}`}><Minus size={12} /></button><span className="w-4 text-center text-xs font-bold">{item.quantity}</span><button onClick={() => onAdjust(item.medicine.id, 1)} className="grid size-6 place-items-center rounded-md hover:bg-card" data-testid={`button-increase-${item.medicine.id}`}><Plus size={12} /></button></div></div>)}</div><div className="my-5 border-t border-border" /><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Choose a pharmacy</p><div className="space-y-2">{pharmacies.map((pharmacy) => <button key={pharmacy.id} onClick={() => setPharmacyId(pharmacy.id)} className={`w-full rounded-xl border p-3 text-left transition ${pharmacy.id === pharmacyId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`} data-testid={`button-pharmacy-${pharmacy.id}`}><div className="flex items-start gap-2"><div className={`mt-0.5 size-2 rounded-full ${pharmacy.id === pharmacyId ? 'bg-primary' : 'border border-muted-foreground'}`} /><div className="min-w-0 flex-1"><p className="text-xs font-bold">{pharmacy.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{pharmacy.distance} · {pharmacy.eta}</p></div><span className="text-[10px] font-bold text-[#27734d]">{pharmacy.stockStatus === 'All items in stock' ? 'Ready' : 'Limited'}</span></div></button>)}</div></div><div className="my-5 border-t border-border" /><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">{money(subtotal)}</span></div><div className="mt-2 flex items-center justify-between text-xs"><span className="text-muted-foreground">Delivery</span><span className="font-bold text-[#27734d]">Free</span></div>{hasRx && !rxUploaded && <div className="mt-4 flex gap-2 rounded-xl bg-accent/15 p-3 text-[11px] leading-4 text-[#805514]"><CircleAlert size={15} className="mt-0.5 shrink-0" />Prescription upload is needed before checkout.</div>}{hasRx && rxUploaded && <div className="mt-4 flex gap-2 rounded-xl bg-[#e2f3e8] p-3 text-[11px] font-bold text-[#27734d]"><CheckCircle2 size={15} />Prescription attached and ready for review.</div>}<Button onClick={onPlaceOrder} className="mt-5 w-full" data-testid="button-place-order">{hasRx && !rxUploaded ? 'Upload prescription to continue' : 'Place order'}<ArrowRight size={16} /></Button></>}</div>;
}

function PharmacistDashboard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState(startingOrders);
  const [selectedId, setSelectedId] = useState(startingOrders[0].id);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | OrderStatus>('All');
  const selected = orders.find((order) => order.id === selectedId) ?? orders[0];
  const visible = orders.filter((order) => filter === 'All' || order.status === filter);
  const updateStatus = (status: OrderStatus) => { setOrders((current) => current.map((order) => order.id === selected.id ? { ...order, status } : order)); setReviewOpen(false); };
  const needsReview = orders.filter((order) => order.status === 'Needs review').length;
  return <AppShell role="pharmacist" onLogout={onLogout}><div className="mx-auto max-w-[1450px] px-5 py-7 md:px-10 md:py-10"><div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-primary">Morning handoff · Harbor Pharmacy</p><h1 className="display-font text-4xl font-semibold tracking-[-.05em] md:text-5xl">Fulfillment queue</h1><p className="mt-3 text-sm text-muted-foreground">Review each request with care before it leaves the counter.</p></div><div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"><div className="grid size-9 place-items-center rounded-xl bg-accent/20 text-[#98631b]"><Clock3 size={18} /></div><div><p className="text-xs font-bold">{needsReview} awaiting review</p><p className="text-[11px] text-muted-foreground">Average response · 4 min</p></div></div></div><div className="mb-5 flex flex-wrap items-center gap-2">{(['All', 'Needs review', 'Approved', 'Query sent', 'Rejected'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`tap rounded-full px-3.5 py-2 text-xs font-bold ${filter === item ? 'bg-sidebar text-sidebar-foreground' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`} data-testid={`filter-${item.toLowerCase().replace(' ', '-')}`}>{item}{item === 'Needs review' && <span className="ml-2 opacity-60">{needsReview}</span>}</button>)}</div><div className="grid gap-5 lg:grid-cols-[minmax(300px,410px)_1fr]"><section className="space-y-3">{visible.map((order, index) => <OrderRow key={order.id} order={order} selected={order.id === selected.id} onClick={() => setSelectedId(order.id)} delay={index % 3} />)}{visible.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><CheckCircle2 className="mx-auto text-[#27734d]" size={30} /><p className="mt-3 font-bold">Nothing in this view</p><p className="mt-1 text-xs text-muted-foreground">Try another queue filter.</p></div>}</section><section className="hidden lg:block"><OrderDetail order={selected} onReview={() => setReviewOpen(true)} onStatus={updateStatus} /></section></div></div>{reviewOpen && <ReviewModal order={selected} onClose={() => setReviewOpen(false)} onStatus={updateStatus} />}</AppShell>;
}

function OrderRow({ order, selected, onClick, delay }: { order: Order; selected: boolean; onClick: () => void; delay: number }) {
  return <button onClick={onClick} className={`card-lift animate-rise-in w-full rounded-2xl border p-4 text-left ${selected ? 'border-primary bg-primary/[.045] shadow-[var(--shadow-sm)]' : 'border-border bg-card'} ${delay ? `delay-${delay}` : ''}`} data-testid={`row-order-${order.id}`}><div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{order.patientInitials}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold">{order.patientName}</p>{order.type === 'prescription' && <Pill size={13} className="text-[#98631b]" />}</div><p className="mt-1 text-[11px] text-muted-foreground">{order.id} · {order.createdAt}</p></div><ChevronRight size={17} className="text-muted-foreground" /></div><div className="mt-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {money(order.total)}</span><Badge tone={order.status === 'Approved' ? 'green' : order.status === 'Needs review' ? 'amber' : order.status === 'Rejected' ? 'red' : 'teal'}>{order.status}</Badge></div></button>;
}

function OrderDetail({ order, onReview, onStatus }: { order: Order; onReview: () => void; onStatus: (status: OrderStatus) => void }) {
  return <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-primary">Order {order.id}</p><h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">{order.patientName}</h2><p className="mt-1 text-xs text-muted-foreground">{order.createdAt} · {order.pharmacy.name}</p></div><Badge tone={order.status === 'Approved' ? 'green' : order.status === 'Needs review' ? 'amber' : order.status === 'Rejected' ? 'red' : 'teal'}>{order.status}</Badge></div><div className="my-6 border-t border-border" /><div className="mb-5 flex items-center justify-between"><h3 className="text-sm font-bold">Requested medicines</h3><span className="text-xs text-muted-foreground">{order.items.length} line items</span></div><div className="space-y-3">{order.items.map((item) => <div className="flex items-center gap-3 rounded-xl bg-secondary/55 p-3" key={item.medicine.id}><div className="grid size-9 place-items-center rounded-lg bg-card text-primary"><Pill size={16} /></div><div className="min-w-0 flex-1"><p className="text-xs font-bold">{item.medicine.name}</p><p className="text-[11px] text-muted-foreground">{item.medicine.form} · Qty {item.quantity}</p></div><span className="text-xs font-bold">{money(item.medicine.price * item.quantity)}</span></div>)}</div>{order.type === 'prescription' && <div className="mt-5 rounded-xl border border-accent/35 bg-accent/10 p-4"><div className="flex items-center gap-2 text-xs font-bold text-[#805514]"><FileText size={15} /> Prescription attached</div><p className="mt-2 text-[11px] leading-5 text-[#805514]/80">Image and extracted instructions are available in the review.</p></div>}<div className="mt-6 flex items-center justify-between border-t border-border pt-5"><div><p className="text-[11px] text-muted-foreground">Order total</p><p className="text-xl font-bold">{money(order.total)}</p></div><div className="flex gap-2">{order.status === 'Needs review' ? <Button onClick={onReview} data-testid="button-review-order">Open review <ArrowRight size={16} /></Button> : <Button onClick={() => onStatus('Needs review')} variant="outline" data-testid="button-reopen-order"><RotateCcw size={15} />Reopen</Button>}</div></div></div>;
}

function ReviewModal({ order, onClose, onStatus }: { order: Order; onClose: () => void; onStatus: (status: OrderStatus) => void }) {
  const [querying, setQuerying] = useState(false);
  return <Modal title={`Review ${order.id}`} eyebrow={`${order.patientName} · ${order.type === 'prescription' ? 'Prescription order' : 'OTC order'}`} onClose={onClose} wide><div className="grid gap-6 md:grid-cols-2"><div><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Source document</h3><Badge tone="green"><ShieldCheck size={11} className="mr-1" />SECURE</Badge></div>{order.type === 'prescription' ? <div className="relative flex min-h-[270px] flex-col justify-between overflow-hidden rounded-2xl border border-[#d5c8af] bg-[#f4eddd] p-6 text-[#514a3d] shadow-inner"><div className="absolute right-4 top-4 rotate-12 rounded border-2 border-[#b78748]/60 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#b78748]">MediFlow scan</div><div><p className="text-[10px] uppercase tracking-[.2em] opacity-55">Harbor Family Practice</p><p className="mt-5 border-b border-[#8b806c]/30 pb-2 font-serif text-lg">Prescription</p><p className="mt-4 whitespace-pre-line font-serif text-sm leading-7 opacity-80">{order.extractedText}</p></div><p className="text-[10px] opacity-50">{order.prescriptionImage}</p></div> : <div className="grid min-h-[270px] place-items-center rounded-2xl border border-border bg-secondary/50 p-8 text-center"><ShoppingBag size={32} className="text-primary" /><p className="mt-3 text-sm font-bold">Over-the-counter request</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">No prescription is required. Confirm product, quantity, and stock before approving.</p></div>}</div><div><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Extracted details</h3><span className="text-[11px] text-muted-foreground">Review before approval</span></div><div className="rounded-2xl border border-border p-4">{order.type === 'prescription' ? <div className="space-y-3"><div className="rounded-xl bg-secondary/60 p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">Instructions detected</p><p className="mt-2 whitespace-pre-line text-xs leading-5">{order.extractedText}</p></div>{order.items.map((item) => <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0" key={item.medicine.id}><div><p className="text-xs font-bold">{item.medicine.name}</p><p className="text-[11px] text-muted-foreground">{item.medicine.genericName}</p></div><CheckCircle2 size={17} className="text-[#27734d]" /></div>)}</div> : <div className="space-y-2">{order.items.map((item) => <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-3" key={item.medicine.id}><div><p className="text-xs font-bold">{item.medicine.name}</p><p className="mt-1 text-[11px] text-muted-foreground">Quantity {item.quantity} · {item.medicine.stock} available</p></div><span className="text-xs font-bold">{money(item.medicine.price * item.quantity)}</span></div>)}</div>}</div><div className="mt-5 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => { setQuerying(true); window.setTimeout(() => { setQuerying(false); onStatus('Query sent'); }, 650); }} disabled={querying} data-testid="button-query-order"><MessageSquare size={15} />{querying ? 'Sending…' : 'Query patient'}</Button><Button variant="danger" onClick={() => onStatus('Rejected')} data-testid="button-reject-order"><XCircle size={15} />Reject</Button><Button className="col-span-2" onClick={() => onStatus('Approved')} data-testid="button-approve-order"><CheckCircle2 size={17} />Approve fulfillment</Button></div></div></div></Modal>;
}

function NotFound() {
  const [, setLocation] = useLocation();
  return <div className="grid min-h-[100dvh] place-items-center bg-background p-6 text-center"><div><div className="mx-auto grid size-16 place-items-center rounded-3xl bg-secondary text-primary"><CircleAlert size={30} /></div><h1 className="display-font mt-5 text-4xl font-semibold">Page not found</h1><p className="mt-2 text-sm text-muted-foreground">This care path does not exist.</p><Button className="mt-6" onClick={() => setLocation('/')} data-testid="button-back-home">Return home</Button></div></div>;
}

function Router() {
  const [location, setLocation] = useLocation();
  const [role, setRole] = useState<Role>(null);
  const login = (nextRole: 'patient' | 'pharmacist') => { setRole(nextRole); setLocation(nextRole === 'patient' ? '/patient' : '/pharmacist'); };
  const logout = () => { setRole(null); setLocation('/'); };
  return <ErrorBoundary resetKey={location}><Switch><Route path="/"><Home onLogin={login} /></Route><Route path="/patient">{role === 'patient' ? <PatientDashboard onLogout={logout} /> : <Home onLogin={login} />}</Route><Route path="/pharmacist">{role === 'pharmacist' ? <PharmacistDashboard onLogout={logout} /> : <Home onLogin={login} />}</Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;