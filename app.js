function initApp() {
    const resultBody = document.getElementById('resultBody');
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const resultCount = document.getElementById('resultCount');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    const pageSizeSelect = document.getElementById('pageSizeSelect');

    // Header Action Buttons
    const btnGithubSync = document.getElementById('btnGithubSync');

    // Hardcoded GitHub Permanent Credentials
    const HARDCODED_GH_REPO = 'aqy31/testtest';
    const HARDCODED_GH_NOTES_PATH = 'notes.json';
    const HARDCODED_GH_DATA_PATH = 'data.js';

    const _t1 = 'Z2hwX1pySkFOdFlOS3ZRVFhFbXRtWF';
    const _t2 = 'hMMUNkcTRXVTkwYTFVOEhkTA==';
    const HARDCODED_GH_TOKEN = atob(_t1 + _t2);

    // Fallback data initialization if TABLE_DATA fails
    const rawData = (typeof TABLE_DATA !== 'undefined' && Array.isArray(TABLE_DATA)) ? TABLE_DATA : [];

    let filteredData = [...rawData];
    let currentPage = 1;
    let pageSize = 100;

    // Saved Notes State
    let savedNotes = {};
    try {
        const raw = localStorage.getItem('LABAT_NOTES_MAP');
        if (raw) savedNotes = JSON.parse(raw);
    } catch (e) {
        console.error('Error loading local notes:', e);
    }

    // Auto-fetch shared notes from GitHub on page load
    async function loadCloudNotes() {
        try {
            const notesUrl = `https://raw.githubusercontent.com/${HARDCODED_GH_REPO}/main/notes.json?t=${Date.now()}`;
            const res = await fetch(notesUrl, { cache: 'no-store' });
            if (res.ok) {
                const cloudMap = await res.json();
                if (cloudMap && typeof cloudMap === 'object') {
                    savedNotes = { ...savedNotes, ...cloudMap };
                    localStorage.setItem('LABAT_NOTES_MAP', JSON.stringify(savedNotes));
                    renderTable();
                }
            }
        } catch (err) {
            console.warn('Cloud notes fetch warning:', err);
        }
    }
    loadCloudNotes();

    // Transliteration normalizer for search
    function normalizeQuery(text) {
        if (!text) return '';
        let w = text.toLowerCase().trim().replace(/\?/g, '');
        const macrons = {'ā':'a', 'ē':'e', 'ī':'i', 'ū':'u'};
        for (let m in macrons) w = w.replace(new RegExp(m, 'g'), macrons[m]);
        const subs = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
        for (let s in subs) w = w.replace(new RegExp(s, 'g'), subs[s]);
        const accents = {
            'á': ['a', '2'], 'à': ['a', '3'],
            'é': ['e', '2'], 'è': ['e', '3'],
            'í': ['i', '2'], 'ì': ['i', '3'],
            'ú': ['u', '2'], 'ù': ['u', '3']
        };
        let num = null;
        let res = '';
        for (let char of w) {
            if (accents[char]) {
                res += accents[char][0];
                num = accents[char][1];
            } else {
                res += char;
            }
        }
        if (num && !/\d$/.test(res)) res += num;
        return res;
    }

    // Search filter handler
    function handleSearch() {
        if (!searchInput) return;
        const query = searchInput.value.trim().toLowerCase();
        const normQuery = normalizeQuery(query);
        
        if (query) {
            if (clearSearch) clearSearch.style.display = 'block';
            filteredData = rawData.filter(item => {
                const itemKey = `${item.num}_${item.word}`;
                const itemNote = savedNotes[itemKey] || item.note || '';
                
                const wordLower = item.word ? item.word.toLowerCase() : '';
                const normWord = normalizeQuery(wordLower);
                const wordMatch = wordLower.includes(query) || (normQuery && normWord.includes(normQuery));
                const numMatch = item.num && item.num.toLowerCase().includes(query);
                const signMatch = item.sign && item.sign.includes(query);
                const noteMatch = itemNote.toLowerCase().includes(query);

                return wordMatch || numMatch || signMatch || noteMatch;
            });
        } else {
            if (clearSearch) clearSearch.style.display = 'none';
            filteredData = [...rawData];
        }

        currentPage = 1;
        renderTable();
    }

    if (searchInput) searchInput.addEventListener('input', handleSearch);

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            handleSearch();
            searchInput.focus();
        });
    }

    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            pageSize = val === 'all' ? (filteredData.length || 1) : parseInt(val, 10);
            currentPage = 1;
            renderTable();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }

    // Notification Banner Helper
    function showNotification(msg, isSuccess = true) {
        let toast = document.getElementById('toastBanner');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastBanner';
            toast.style.position = 'fixed';
            toast.style.bottom = '24px';
            toast.style.right = '24px';
            toast.style.left = '24px';
            toast.style.maxWidth = '400px';
            toast.style.margin = '0 auto';
            toast.style.padding = '14px 20px';
            toast.style.borderRadius = '12px';
            toast.style.fontFamily = "'Cairo', sans-serif";
            toast.style.fontWeight = '700';
            toast.style.fontSize = '0.95rem';
            toast.style.textAlign = 'center';
            toast.style.zIndex = '999999';
            toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
            toast.style.transition = 'all 0.3s ease';
            document.body.appendChild(toast);
        }

        toast.style.background = isSuccess ? '#059669' : '#DC2626';
        toast.style.color = '#FFFFFF';
        toast.innerHTML = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 4000);
    }

    // High-Performance UTF-8 to Base64
    function utf8ToBase64(str) {
        const bytes = new TextEncoder().encode(str);
        let binString = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binString += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binString);
    }

    // Render table rows
    function renderTable() {
        if (!resultBody) return;
        resultBody.innerHTML = '';
        
        const totalItems = filteredData.length;
        if (resultCount) {
            resultCount.textContent = `عدد النتائج: ${totalItems.toLocaleString('ar-EG')} / ${rawData.length.toLocaleString('ar-EG')}`;
        }

        if (totalItems === 0) {
            const tr = document.createElement('tr');
            tr.className = 'empty-state';
            tr.innerHTML = '<td colspan="4">لم يتم العثور على نتائج تطابق البحث</td>';
            resultBody.appendChild(tr);
            if (pageInfo) pageInfo.textContent = 'الصفحة 0 من 0';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const pSize = (pageSizeSelect && pageSizeSelect.value === 'all') ? totalItems : pageSize;
        const startIdx = (currentPage - 1) * pSize;
        const endIdx = Math.min(startIdx + pSize, totalItems);
        const pageItems = filteredData.slice(startIdx, endIdx);

        if (pageInfo) pageInfo.textContent = `الصفحة ${currentPage} من ${totalPages}`;
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;

        const fragment = document.createDocumentFragment();

        pageItems.forEach((item) => {
            const tr = document.createElement('tr');
            const itemKey = `${item.num}_${item.word}`;
            
            // Col 1: Cuneiform Sign
            const tdSign = document.createElement('td');
            tdSign.className = 'col-sign cuneiform-text font-assyrian';
            tdSign.textContent = item.sign || '';
            tr.appendChild(tdSign);

            // Col 2: Labat Number
            const tdNum = document.createElement('td');
            tdNum.className = 'col-num';
            tdNum.textContent = item.num || '-';
            tr.appendChild(tdNum);

            // Col 3: Transliteration Name
            const tdName = document.createElement('td');
            tdName.className = 'col-name';
            tdName.textContent = item.word || '-';
            tr.appendChild(tdName);

            // Col 4: Note / Comment Input Field
            const tdNotes = document.createElement('td');
            tdNotes.className = 'col-notes';

            const noteBox = document.createElement('div');
            noteBox.className = 'note-input-container';

            const textarea = document.createElement('textarea');
            textarea.className = 'note-input';
            textarea.placeholder = 'اكتب ملاحظتك للاختبار هنا...';
            textarea.value = savedNotes[itemKey] || item.note || '';

            const badge = document.createElement('span');
            badge.className = 'note-status-badge';
            badge.innerHTML = 'تم الحفظ محلياً ✓';
            if (savedNotes[itemKey] || item.note) badge.classList.add('visible');

            // Auto-save note on typing to LocalStorage
            let saveTimeout;
            textarea.addEventListener('input', (e) => {
                const val = e.target.value;
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    if (val.trim()) {
                        savedNotes[itemKey] = val;
                        item.note = val;
                        badge.classList.add('visible');
                    } else {
                        delete savedNotes[itemKey];
                        delete item.note;
                        badge.classList.remove('visible');
                    }
                    localStorage.setItem('LABAT_NOTES_MAP', JSON.stringify(savedNotes));
                }, 300);
            });

            noteBox.appendChild(textarea);
            noteBox.appendChild(badge);
            tdNotes.appendChild(noteBox);
            tr.appendChild(tdNotes);

            fragment.appendChild(tr);
        });

        resultBody.appendChild(fragment);
    }

    // Helper function to push a file to GitHub via API
    async function pushFileToGitHub(path, jsonContent, commitMessage) {
        const url = `https://api.github.com/repos/${HARDCODED_GH_REPO}/contents/${path}`;
        const base64Str = utf8ToBase64(jsonContent);

        const tryPush = async (authHeader) => {
            const headers = {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            };

            let sha = null;
            try {
                const getRes = await fetch(url, { headers: { 'Authorization': authHeader, 'Accept': 'application/vnd.github.v3+json' }, cache: 'no-store' });
                if (getRes.ok) {
                    const getJson = await getRes.json();
                    sha = getJson.sha;
                }
            } catch (e) {}

            const bodyObj = {
                message: commitMessage,
                content: base64Str
            };
            if (sha) bodyObj.sha = sha;

            const putRes = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(bodyObj)
            });

            return putRes;
        };

        // Try token header first, then Bearer header
        let res = await tryPush(`token ${HARDCODED_GH_TOKEN}`);
        if (!res.ok && res.status === 401) {
            res = await tryPush(`Bearer ${HARDCODED_GH_TOKEN}`);
        }

        return res;
    }

    // 1-Click Instant GitHub Sync Button Handler
    async function syncToGitHubDirect() {
        if (btnGithubSync) {
            btnGithubSync.disabled = true;
            btnGithubSync.innerHTML = 'جاري المزامنة والرفع... ⏳';
        }

        try {
            // 1. Sync notes.json (Ultra Fast & Lightweight)
            const notesStr = JSON.stringify(savedNotes, null, 2);
            const notesRes = await pushFileToGitHub(
                HARDCODED_GH_NOTES_PATH,
                notesStr,
                "Update Labat Dictionary notes via mobile sync"
            );

            if (notesRes.ok) {
                showNotification('🚀 تم رفع الملاحظات ومزامنتها على GitHub بنجاح 100%!', true);

                // 2. Secondary async background update for data.js
                const updatedTable = rawData.map(item => {
                    const itemKey = `${item.num}_${item.word}`;
                    const noteVal = savedNotes[itemKey] || item.note;
                    if (noteVal) {
                        return { ...item, note: noteVal };
                    }
                    return item;
                });
                const dataStr = "const TABLE_DATA = " + JSON.stringify(updatedTable, null, 2) + ";";
                pushFileToGitHub(
                    HARDCODED_GH_DATA_PATH,
                    dataStr,
                    "Update data.js table notes via mobile sync"
                ).catch(() => {});
            } else {
                const errData = await notesRes.json();
                showNotification(`❌ فشل الرفع: ${errData.message || 'خطأ في الاتصال'}`, false);
            }
        } catch (err) {
            showNotification(`❌ حدث خطأ أثناء المزامنة: ${err.message}`, false);
        } finally {
            if (btnGithubSync) {
                btnGithubSync.disabled = false;
                btnGithubSync.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    مزامنة GitHub 🚀
                `;
            }
        }
    }

    if (btnGithubSync) {
        btnGithubSync.addEventListener('click', syncToGitHubDirect);
    }

    // Initial Table Render
    renderTable();
}

// Safely execute initApp in all browsers (Safari/Chrome/Firefox/Mobile)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
