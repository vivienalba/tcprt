export const projects = {
  tidygrid: {
    title:'Data Cleaning & Standardization Tool',eyebrow:'TOOLS / TIDYGRID',category:'Business data, ready for the next step.',
    description:'A Python and Streamlit application that automates repetitive data cleaning tasks, transforming messy records into standardized, ready to use business data.',
    problem:'Repeated rows, inconsistent spacing, and missing information make everyday spreadsheet work harder to manage.',
    approach:'A guided upload, review, clean, and download process for CSV and Excel files, including multi-sheet workbooks. Users can choose cleanup options and review the result before using it in a business workflow.',
    details:['Standardized formatting and duplicate cleanup','Missing-data review before export','Downloadable results for reporting and operational workflows'],
    tools:['Python','Streamlit','Pandas','Data Cleaning','Data Automation','Excel'],status:'INDEPENDENT PROJECT',demo:true,
    image:'tidygrid',link:'https://vivsopscleaner.streamlit.app/#welcome-to-vivs-operations-cleaner',linkLabel:'Open the data cleaning tool'
  },
  websites: {
    title:'Hella Nails Website',eyebrow:'WEBSITE CONCEPT / SERVICE BUSINESS',category:'Your colour. Your details.',
    description:'Service website concept featuring pricing, categorized services, availability, and online booking.',
    problem:'A service website needs to make prices, service categories, and the next step easy to find.',
    approach:'A brochure-style website refined through iterations on spacing, typography, sticky navigation, mobile menus, and the appointment inquiry experience.',
    details:['Categorized service information and a price list','Responsive layouts and smooth mobile navigation','A clear appointment inquiry path'],
    tools:['Shopify / Web Development','UI/UX','Booking'],status:'SERVICE WEBSITE CONCEPT',image:'hella-nails',
    link:'https://vivienalba.github.io/hella-nails/',linkLabel:'Visit Hella Nails'
  },
  paperless: {
    title:'Paperless Operations System',eyebrow:'OPERATIONS / PROCESS DESIGN',category:'A clearer way to manage bookings and records.',
    description:'Digital booking and records workflow created to streamline administrative processes for an equipment business.',
    problem:'Booking information, equipment records, and administrative documents need to stay organized and accessible as the business changes.',
    approach:'Moved bookings and records into an electronic workflow, maintained operational spreadsheets in Excel, and organized the documentation supporting day-to-day operations.',
    details:['Electronic booking and digital record keeping','Excel-based operational records and administrative documentation','Developed in the SailMark operations role'],
    tools:['Excel','Digital Operations','Process Design'],status:'OPERATIONS SYSTEM / WORK EXPERIENCE',image:'paperless'
  },
  pinkroom: {
    title:'Scrapbook Inspired Photobooth',eyebrow:'WEB EXPERIENCES / PINK ROOM',category:'Three little moments. One little keepsake.',
    description:'Interactive browser based photobooth with photo capture, filters, custom strips, and video recording.',
    problem:'A photobooth should feel simple while keeping the camera preview, filters, and exported output consistent.',
    approach:'Built with browser camera, Canvas, and Media APIs, then refined the layout and capture experience through multiple UI/UX iterations.',
    details:['Mirrored camera preview and three-photo strips','Filters applied to the downloadable output','A 30-second video mode'],
    tools:['HTML','CSS','JavaScript','Web Development','UI/UX Design','GitHub Pages'],status:'INDEPENDENT PROJECT',image:'pink-room',
    link:'https://vivienalba.github.io/hspb/',linkLabel:'Visit the photobooth'
  }
};
// A fixed, illustrative sample. It does not upload or process visitor files.
export const sampleRows = [
  {name:'  Maria Santos  ',email:'MARIA@EMAIL.COM ',status:'Confirmed'},
  {name:'Juan Dela Cruz',email:' juan@email.com',status:'Pending'},
  {name:'  Maria Santos  ',email:'MARIA@EMAIL.COM ',status:'Confirmed'},
  {name:'Ana Reyes ',email:'',status:'Pending'}
];
export function cleanSample(rows) {
  const seen=new Set();
  const cleaned=rows.map(row=>({name:row.name.trim().replace(/\s+/g,' '),email:row.email.trim().toLowerCase(),status:row.status.trim()})).filter(row=>{
    const key=JSON.stringify(row);
    if(seen.has(key))return false;
    seen.add(key);return true;
  });
  return {rows:cleaned,duplicatesRemoved:rows.length-cleaned.length,missingEmails:cleaned.filter(row=>!row.email).length};
}
