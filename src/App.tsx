import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Expand,
  MapPin,
  Minus,
  MoveUpRight,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';

type PlaceId = 'madan' | 'bhedaghat' | 'kachnar' | 'dumna' | 'museum' | 'ghat';
type View = 'landing' | 'flight' | 'destination';
type DetailTab = 'overview' | 'timeline' | 'gallery';

type Place = {
  id: PlaceId;
  name: string;
  category: string;
  period: string;
  score: number;
  description: string;
  accent: string;
  imagePosition: string;
  tags: string[];
  why: string;
};

const mapImage = '/ChatGPT_Image_Aug_29,_2026,_06_04_42_PM.png';

const places: Place[] = [
  { id: 'madan', name: 'Madan Mahal', category: 'Historical Fortress', period: '11th century', score: 94, description: 'Perched above the city, a compact stone sentinel keeps watch over Jabalpur’s medieval memory.', accent: '#ba7a4d', imagePosition: 'center top', tags: ['kingdoms', 'architecture'], why: 'A rare, intimate glimpse into the Gond kingdom — where the scale of the fort makes the landscape feel even larger.' },
  { id: 'bhedaghat', name: 'Bhedaghat', category: 'Natural + Cultural Heritage', period: 'Narmada landscape', score: 97, description: 'Marble cliffs, river mist and the patient force of the Narmada meet in one unforgettable landscape.', accent: '#70969a', imagePosition: 'left center', tags: ['narmada', 'legends'], why: 'The Narmada turns geology into theatre here, carving a place that has been witnessed, narrated and revisited for generations.' },
  { id: 'kachnar', name: 'Kachnar City Shiva Temple', category: 'Modern Landmark', period: '21st century', score: 88, description: 'A monumental contemporary shrine where scale, devotion and the Jabalpur skyline converge.', accent: '#8d7869', imagePosition: 'right top', tags: ['architecture', 'people'], why: 'A living landmark that shows how a city continues to make symbols for itself.' },
  { id: 'dumna', name: 'Dumna Nature Reserve', category: 'Wild Landscape', period: 'Living archive', score: 82, description: 'A green edge to the city, where trails, water and the quiet rhythm of the forest take over.', accent: '#607b62', imagePosition: 'left bottom', tags: ['lost places', 'people'], why: 'For the pause between stories: a place where Jabalpur’s natural memory is still in motion.' },
  { id: 'museum', name: 'Rani Durgavati Museum', category: 'Cultural Archive', period: '20th century', score: 86, description: 'Objects, portraits and fragments gathered into a roomful of regional memory.', accent: '#93745a', imagePosition: 'center center', tags: ['people', 'kingdoms'], why: 'The city speaks through what it chooses to preserve.' },
  { id: 'ghat', name: 'Goura Ghat', category: 'Riverfront Memory', period: 'Narmada landscape', score: 79, description: 'A slower river edge for evening light, small rituals and unhurried observation.', accent: '#647f8a', imagePosition: 'right bottom', tags: ['narmada', 'people'], why: 'Not every archive is monumental. Some are held by a riverbank at dusk.' },
];

const chapters = [
  { label: 'Chapter I', title: 'The Sentinel Stone', copy: 'Rising above the landscape, Madan Mahal became a powerful symbol of the kingdom that once shaped this region.', imagePosition: 'center top' },
  { label: 'Chapter II', title: 'The Fort', copy: 'Its compact rooms and thick walls hold the feeling of a lookout: built for attention, not spectacle.', imagePosition: 'left center' },
  { label: 'Chapter III', title: 'The Kingdom', copy: 'Below the hill, a city keeps changing. Above it, the fort gives the past a fixed horizon.', imagePosition: 'right top' },
  { label: 'Chapter IV', title: 'The People', copy: 'History becomes intimate in the traces people leave behind — routes, rituals, stories and names.', imagePosition: 'center center' },
  { label: 'Chapter V', title: 'Today', copy: 'The stone remains a quiet witness, inviting a new generation to look closer.', imagePosition: 'left bottom' },
];

const journeys = [
  { title: 'Medieval Jabalpur', meta: '4 places · 3 hours', description: 'A compact route through forts, rulers and the city’s oldest viewpoints.', accent: '#a56d48' },
  { title: 'Along the Narmada', meta: '5 places · 1 day', description: 'Follow the river from marble cliffs to evening ghats.', accent: '#557c82' },
  { title: 'Forgotten Jabalpur', meta: '6 stories · 2.5 hours', description: 'Look beyond the landmarks for the quieter archive of the city.', accent: '#68715c' },
];

const answers: Record<string, string> = {
  'Give me an itinerary': 'Here’s a simple Jabalpur heritage day:\n\n09:00 AM — Madan Mahal\n10:30 AM — Kachnar City Shiva Temple\n12:00 PM — Lunch\n02:00 PM — Bhedaghat\n04:30 PM — Dhuandhar Falls\n06:00 PM — Narmada sunset\n\nA balanced day combining history, architecture and the Narmada landscape.',
  'When was Madan Mahal built?': 'Madan Mahal is traditionally associated with the Gond ruler Madan Singh and is generally dated to the medieval period. In this demo, this historical information is presented as sample content.',
  'Why is Bhedaghat famous?': 'Bhedaghat is famous for the dramatic Marble Rocks along the Narmada River and the nearby Dhuandhar Falls. In this demo, the description is sample heritage content.',
  'Tell me about Kachnar Shiva Temple': 'Kachnar City Shiva Temple is one of Jabalpur’s recognizable modern landmarks, known for its large Shiva statue and distinctive temple complex. This prototype uses sample content for demonstration.',
  'What should I visit today?': 'For a first visit, I’d recommend Madan Mahal in the morning, Bhedaghat in the afternoon and a Narmada-side stop toward sunset.',
};
const suggestedQuestions = Object.keys(answers);

function App() {
  const [view, setView] = useState<View>('landing');
  const [query, setQuery] = useState('');
  const [flightStage, setFlightStage] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [storyOpen, setStoryOpen] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideInput, setGuideInput] = useState('');
  const [messages, setMessages] = useState<{ from: 'guide' | 'you'; text: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [toast, setToast] = useState('');
  const [journey, setJourney] = useState<string | null>(null);

  useEffect(() => {
    if (view !== 'flight') return;
    setFlightStage(1);
    const timerOne = window.setTimeout(() => setFlightStage(2), 1200);
    const timerTwo = window.setTimeout(() => setFlightStage(3), 2400);
    const timerThree = window.setTimeout(() => setFlightStage(4), 3600);
    const timerFour = window.setTimeout(() => { setView('destination'); setFlightStage(0); }, 4400);
    return () => { window.clearTimeout(timerOne); window.clearTimeout(timerTwo); window.clearTimeout(timerThree); window.clearTimeout(timerFour); };
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredPlaces = useMemo(() => activeCategory === 'all' ? places : places.filter((place) => place.tags.includes(activeCategory)), [activeCategory]);

  const startSearch = (event?: FormEvent) => {
    event?.preventDefault();
    if (query.trim().toLowerCase() !== 'jabalpur') {
      setToast('Jabalpur is currently the available demo destination.');
      return;
    }
    setView('flight');
  };

  const openPlace = (id: PlaceId) => {
    const place = places.find((item) => item.id === id);
    if (place) { setSelectedPlace(place); setDetailTab('overview'); }
  };

  const askGuide = (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const normalized = cleanQuestion.toLowerCase();
    const exactMatch = Object.keys(answers).find((key) => key.toLowerCase() === normalized);
    let answer: string;
    if (exactMatch) {
      answer = answers[exactMatch];
    } else if (normalized.includes('itinerary') || normalized.includes('plan') || normalized.includes('schedule') || normalized.includes('day trip')) {
      answer = answers['Give me an itinerary'];
    } else if (normalized.includes('madan mahal') && (normalized.includes('build') || normalized.includes('when') || normalized.includes('date') || normalized.includes('old'))) {
      answer = answers['When was Madan Mahal built?'];
    } else if (normalized.includes('bhedaghat') && (normalized.includes('famous') || normalized.includes('why') || normalized.includes('what'))) {
      answer = answers['Why is Bhedaghat famous?'];
    } else if (normalized.includes('kachnar') || (normalized.includes('shiva') && normalized.includes('temple'))) {
      answer = answers['Tell me about Kachnar Shiva Temple'];
    } else if (normalized.includes('visit') || normalized.includes('today') || normalized.includes('recommend') || normalized.includes('see') || normalized.includes('should i')) {
      answer = answers['What should I visit today?'];
    } else {
      answer = 'I’m currently a demo Heritage Guide, so I can answer only a few prepared questions.';
    }
    setMessages((current) => [...current, { from: 'you', text: cleanQuestion }, { from: 'guide', text: answer }]);
    setGuideInput('');
  };

  const closeOverlays = () => { setMapOpen(false); setSelectedPlace(null); setStoryOpen(false); setJourney(null); };

  return (
    <main className={`app-shell view-${view}`}>
      <div className="grain" />
      <header className="topbar">
        <button className="wordmark" onClick={() => { closeOverlays(); setView('landing'); }} aria-label="Return to home"><span className="wordmark-mark"><span /></span>ARCHIVE</button>
        <nav className="topnav"><button onClick={() => setView('destination')}>Explore</button><button onClick={() => setToast('Stories are unfolding in the archive.')}>Stories</button><button onClick={() => setToast('Curated journeys are available below.')}>Journeys</button><button onClick={() => setToast('A prototype for discovering place through memory.')}>About</button></nav>
        <button className="guide-trigger" onClick={() => setGuideOpen(true)}><Sparkles size={14} /> Ask the guide</button>
      </header>

      {view === 'landing' && <Landing query={query} setQuery={setQuery} startSearch={startSearch} setToast={setToast} />}
      {view === 'flight' && <Flight stage={flightStage} />}
      {view === 'destination' && <Destination filteredPlaces={filteredPlaces} activeCategory={activeCategory} setActiveCategory={setActiveCategory} openMap={() => setMapOpen(true)} openPlace={openPlace} setToast={setToast} setJourney={setJourney} />}

      <div className="coordinates"><span>23° 10′ 48″ N</span><span>79° 59′ 02″ E</span></div>
      <div className="edge-label">A LIVING ARCHIVE OF PLACE <span>01 / 06</span></div>

      {mapOpen && <MapOverlay close={() => setMapOpen(false)} onOpenPlace={() => { setMapOpen(false); openPlace('madan'); }} />}
      {selectedPlace && <Detail place={selectedPlace} tab={detailTab} setTab={setDetailTab} close={() => setSelectedPlace(null)} openStory={() => { setSelectedPlace(null); setStoryOpen(true); setChapter(0); }} setToast={setToast} />}
      {storyOpen && <Story chapter={chapter} setChapter={setChapter} close={() => setStoryOpen(false)} />}
      {journey && <Journey title={journey} close={() => setJourney(null)} openPlace={openPlace} />}
      <Guide open={guideOpen} close={() => setGuideOpen(false)} messages={messages} input={guideInput} setInput={setGuideInput} ask={askGuide} />
      {toast && <div className="toast"><Check size={14} />{toast}</div>}
    </main>
  );
}

function Landing({ query, setQuery, startSearch, setToast }: { query: string; setQuery: (value: string) => void; startSearch: (event?: FormEvent) => void; setToast: (value: string) => void }) {
  return <section className="landing-stage">
    <div className="stars stars-one" /><div className="stars stars-two" />
    <div className="globe-wrap"><div className="globe-atmosphere" /><div className="globe"><div className="globe-rotator"><div className="globe-continents"><div className="continent c-africa" /><div className="continent c-europe" /><div className="continent c-asia" /><div className="continent c-india" /><div className="continent c-americas" /></div></div><div className="globe-clouds" /><div className="globe-terminator" /><div className="globe-specular" /></div></div>
    <div className="landing-copy"><p className="eyebrow"><span className="eyebrow-line" />A DIGITAL HERITAGE DISCOVERY PLATFORM</p><h1>Travel through places.<br /><em>Discover their stories.</em></h1><p className="landing-subtitle">Explore the history, culture and hidden stories of the places around you.</p>
      <form className="searchbox" onSubmit={startSearch}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Where do you want to explore?" /><button type="submit">Search <ArrowRight size={16} /></button></form>
      <div className="quick-search"><span>Try exploring</span><button onClick={() => setQuery('Jabalpur')}>Jabalpur</button><button onClick={() => setToast('Jabalpur is currently the available demo destination.')}>Varanasi</button><button onClick={() => setToast('Jabalpur is currently the available demo destination.')}>Jaipur</button><button onClick={() => setToast('Jabalpur is currently the available demo destination.')}>Delhi</button></div>
    </div>
    <div className="landing-aside"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={17} /></div>
    <div className="landing-stats"><div><strong>01</strong><span>PLACE<br />IN FOCUS</span></div><div><strong>06</strong><span>STORIES<br />TO FOLLOW</span></div><div><strong>∞</strong><span>WAYS TO<br />REMEMBER</span></div></div>
  </section>;
}

function Globe({ zoom = false }: { zoom?: boolean }) { return <div className={`flight-globe ${zoom ? 'zoomed' : ''}`}><div className="flight-rotator"><div className="fc fc-africa" /><div className="fc fc-asia" /><div className="fc fc-india" /></div><div className="flight-clouds" /><div className="flight-terminator" /><div className="flight-specular" /></div>; }
function Flight({ stage }: { stage: number }) {
  const label = stage <= 1 ? 'TRAVELLING TO' : stage === 2 ? 'APPROACHING' : 'ARRIVING AT';
  const title = stage <= 1 ? 'Jabalpur' : stage === 2 ? 'Madhya Pradesh' : 'Jabalpur';
  const region = stage <= 1 ? 'Madhya Pradesh, India' : stage === 2 ? 'Central India' : '23.18° N · 79.98° E';
  return <section className={`flight-stage flight-stage-${stage}`}><Globe zoom={stage >= 3} />{stage >= 1 && stage <= 3 && <div className="flight-reticle" />}<div className="flight-copy"><p className="eyebrow"><span className="eyebrow-line" />{label}</p><h2>{title}</h2><p className="flight-region">{region}</p></div><div className="flight-data"><span>23.18° N</span><span>79.98° E</span></div><div className="flight-progress"><span style={{ width: `${Math.min(stage, 4) * 25}%` }} /></div>{stage >= 4 && <div className="flight-flash" />}</section>;
}

function Destination({ filteredPlaces, activeCategory, setActiveCategory, openMap, openPlace, setToast, setJourney }: { filteredPlaces: Place[]; activeCategory: string; setActiveCategory: (value: string) => void; openMap: () => void; openPlace: (id: PlaceId) => void; setToast: (value: string) => void; setJourney: (value: string) => void }) {
  return <section className="destination">
    <div className="destination-intro"><p className="eyebrow"><span className="eyebrow-line" />DESTINATION 01 · MADHYA PRADESH · INDIA</p><h2>Jabalpur<span>.</span></h2><p>Where kingdoms, rivers<br />and stories meet.</p></div>
    <div className="map-frame" onClick={openMap}><img src={mapImage} alt="Illustrated map of Jabalpur heritage locations" /><div className="map-overlay-label"><MapPin size={15} /> JABALPUR HERITAGE MAP <Expand size={14} /></div><div className="map-pulse pulse-one" /><div className="map-pulse pulse-two" /></div>
    <div className="discover-panel"><div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h3>Heritage discoveries</h3></div><span className="result-count">{filteredPlaces.length.toString().padStart(2, '0')} / 06</span></div><div className="category-row"><button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>All stories</button>{['kingdoms', 'narmada', 'architecture', 'people'].map((category) => <button className={activeCategory === category ? 'active' : ''} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="cards-grid">{filteredPlaces.map((place, index) => <PlaceCard key={place.id} place={place} index={index} openPlace={openPlace} />)}</div></div>
    <div className="destination-footer"><div className="footer-note"><span className="number-mark">02</span><span>Discover Jabalpur<br />through its stories.</span></div><button className="journeys-link" onClick={() => setJourney('Medieval Jabalpur')}>View curated journeys <MoveUpRight size={15} /></button></div>
    <div className="journeys-strip"><p className="eyebrow">FOLLOW A THREAD</p><div className="journey-list">{journeys.map((item) => <button key={item.title} onClick={() => setJourney(item.title)}><span className="journey-color" style={{ background: item.accent }} /><span><strong>{item.title}</strong><small>{item.meta}</small></span><ArrowRight size={15} /></button>)}</div></div>
  </section>;
}

function PlaceCard({ place, index, openPlace }: { place: Place; index: number; openPlace: (id: PlaceId) => void }) { return <article className={`place-card card-${index}`} onClick={() => openPlace(place.id)}><div className="card-art" style={{ '--card-accent': place.accent, '--image-position': place.imagePosition } as React.CSSProperties}><div className="art-sun" /><div className="art-ridge ridge-one" /><div className="art-ridge ridge-two" /><div className="art-lines" /><span className="card-index">0{index + 1}</span></div><div className="card-body"><div className="card-top"><span>{place.category}</span><strong>{place.score}<small> / 100</small></strong></div><h4>{place.name}</h4><p>{place.description}</p><div className="card-bottom"><span>Explore story</span><ArrowUpRight /></div></div></article>; }

function MapOverlay({ close, onOpenPlace }: { close: () => void; onOpenPlace: () => void }) { return <div className="overlay map-overlay"><button className="close-button" onClick={close}><X size={20} /> Close</button><div className="overlay-kicker">ARCHIVE / CARTOGRAPHY / 01</div><img src={mapImage} alt="Expanded illustrated map of Jabalpur" onClick={onOpenPlace} className="map-overlay-image" /><div className="map-overlay-title"><p className="eyebrow">JABALPUR HERITAGE MAP</p><h2>Read the city<br /><em>from above.</em></h2><p className="map-hint">Click the map to explore Madan Mahal</p></div><div className="map-controls"><button><Plus size={17} /></button><button><Minus size={17} /></button></div></div>; }

function Detail({ place, tab, setTab, close, openStory, setToast }: { place: Place; tab: DetailTab; setTab: (value: DetailTab) => void; close: () => void; openStory: () => void; setToast: (value: string) => void }) { return <div className="overlay detail-overlay"><button className="back-button" onClick={close}><ArrowLeft size={17} /> Back to discoveries</button><div className="detail-hero"><div className="detail-art" style={{ '--card-accent': place.accent, '--image-position': place.imagePosition } as React.CSSProperties}><div className="art-sun" /><div className="art-ridge ridge-one" /><div className="art-ridge ridge-two" /><div className="art-lines" /></div><div className="detail-hero-copy"><p className="eyebrow">{place.category} <span className="dot" /> {place.period}</p><h2>{place.name}<span>.</span></h2><p className="detail-subtitle">{place.id === 'madan' ? 'Fortress above the city' : place.id === 'bhedaghat' ? 'Where the Narmada meets marble cliffs.' : place.id === 'kachnar' ? 'An iconic modern landmark of Jabalpur.' : 'A living fragment of Jabalpur.'}</p><div className="detail-score"><strong>{place.score}</strong><span>DISCOVERY<br />SCORE</span></div><div className="detail-actions"><button className="primary-action" onClick={place.id === 'madan' ? openStory : () => setToast('Story mode is being prepared for this place.')}>Explore story <ArrowRight size={16} /></button><button className="icon-action" onClick={() => setToast('Saved to your personal archive.')}><Bookmark size={17} /></button><button className="icon-action" onClick={() => setToast('Share link copied for this demo.')}><Share2 size={17} /></button></div></div></div><div className="detail-body"><div className="detail-tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button><button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}>Timeline</button><button className={tab === 'gallery' ? 'active' : ''} onClick={() => setTab('gallery')}>Gallery</button></div>{tab === 'overview' && <div className="overview-grid"><div><p className="eyebrow">WHY EXPLORE THIS?</p><p className="large-copy">{place.why}</p></div><div className="detail-facts"><Fact title="Historical significance" copy="A sample account of how this place sits inside the wider memory of Jabalpur." /><Fact title="Architecture" copy="Stone, scale and light become clues in this fictional archive entry." /><Fact title="People & events" copy="Stories gain their shape through the people who return to them." /><Fact title="Today" copy="A landmark still in conversation with the city around it." /></div></div>}{tab === 'timeline' && <Timeline place={place} />}{tab === 'gallery' && <Gallery place={place} />}</div></div>; }
function Fact({ title, copy }: { title: string; copy: string }) { return <details className="fact" open={title === 'Historical significance'}><summary>{title}<ChevronDown size={16} /></summary><p>{copy}</p></details>; }
function Timeline({ place }: { place: Place }) { return <div className="timeline"><p className="eyebrow">A SAMPLE TIMELINE</p>{['Origins', 'The landmark takes shape', 'Memory in motion', 'Jabalpur today'].map((item, index) => <div className="timeline-row" key={item}><span>0{index + 1}</span><div><strong>{item}</strong><p>{index === 0 ? `${place.name} enters the archive as a marker of place.` : 'A fictional chapter in this prototype’s heritage record.'}</p></div><small>{index === 0 ? place.period : `${2026 - (3 - index) * 40}`}</small></div>)}</div>; }
function Gallery({ place }: { place: Place }) { return <div className="gallery"><div className="gallery-head"><p className="eyebrow">VISUAL FRAGMENTS</p><span>03 / 04</span></div><div className="gallery-grid">{['Modern view', 'Historical view', 'Details', 'Then & now'].map((label, index) => <div className={`gallery-tile tile-${index}`} style={{ '--card-accent': place.accent } as React.CSSProperties} key={label}><div className="art-sun" /><div className="art-ridge ridge-one" /><div className="art-ridge ridge-two" /><span>{label}</span></div>)}</div></div>; }

function Story({ chapter, setChapter, close }: { chapter: number; setChapter: (value: number) => void; close: () => void }) { const item = chapters[chapter]; return <div className="overlay story-overlay"><div className="story-image" style={{ '--image-position': item.imagePosition } as React.CSSProperties}><div className="story-image-lines" /></div><div className="story-shade" /><button className="close-button" onClick={close}><X size={20} /> Exit story</button><div className="story-progress">{chapters.map((_, index) => <button key={index} className={index <= chapter ? 'active' : ''} onClick={() => setChapter(index)}><span /></button>)}</div><div className="story-content"><p className="eyebrow">{item.label} <span className="story-divider" /> MADAN MAHAL</p><h2>{item.title}</h2><p>{item.copy}</p><div className="story-controls"><button disabled={chapter === 0} onClick={() => setChapter(chapter - 1)}><ChevronLeft size={17} /> Previous</button><span>0{chapter + 1} / 05</span><button onClick={() => chapter === chapters.length - 1 ? close() : setChapter(chapter + 1)}>{chapter === chapters.length - 1 ? 'Return' : 'Next chapter'} <ChevronRight size={17} /></button></div></div><span className="story-corner">ARCHIVE / STORY MODE</span></div>; }

function Journey({ title, close, openPlace }: { title: string; close: () => void; openPlace: (id: PlaceId) => void }) { const route = title === 'Along the Narmada' ? ['Bhedaghat', 'Goura Ghat', 'Tilwara Ghat'] : title === 'Forgotten Jabalpur' ? ['Dumna Nature Reserve', 'Rani Durgavati Museum', 'Goura Ghat'] : ['Madan Mahal', 'Kachnar City Shiva Temple', 'Bhedaghat']; return <div className="overlay journey-overlay"><button className="close-button" onClick={close}><X size={20} /> Close</button><div className="journey-head"><p className="eyebrow">CURATED JOURNEY / 01</p><h2>{title}<span>.</span></h2><p>A sample route through Jabalpur’s layered memory.</p></div><div className="route-list">{route.map((name, index) => <button key={name} onClick={() => { const place = places.find((item) => item.name === name); if (place) openPlace(place.id); }}><span>0{index + 1}</span><strong>{name}</strong><small>{index === 0 ? 'Begin here' : `${index * 90} min later`}</small><ArrowRight size={16} /></button>)}</div></div>; }

function Guide({ open, close, messages, input, setInput, ask }: { open: boolean; close: () => void; messages: { from: 'guide' | 'you'; text: string }[]; input: string; setInput: (value: string) => void; ask: (question: string) => void }) { const messagesRef = useRef<HTMLDivElement>(null); useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight; }, [messages]); return <aside className={`guide ${open ? 'open' : ''}`}><div className="guide-head"><div><p className="eyebrow"><Sparkles size={12} /> ARCHIVE GUIDE</p><h3>Ask the guide</h3></div><button onClick={close}><X size={18} /></button></div><div className="guide-messages" ref={messagesRef}><div className="guide-welcome"><div className="guide-orb"><Compass size={22} /></div><p>How can I help you<br />explore Jabalpur?</p></div>{messages.map((message, index) => <div className={`message ${message.from}`} key={`${message.text}-${index}`}><span>{message.text}</span></div>)}</div><div className="guide-suggestions"><p>Try asking</p>{suggestedQuestions.map((question) => <button key={question} onClick={() => ask(question)}>{question}<ArrowUpRight size={13} /></button>)}</div><form className="guide-input" onSubmit={(event) => { event.preventDefault(); ask(input); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a prepared question..." /><button type="submit"><Send size={15} /></button></form></aside>; }

export default App;
