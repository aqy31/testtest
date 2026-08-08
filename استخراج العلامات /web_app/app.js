document.addEventListener('DOMContentLoaded', () => {
    const resultTable = document.getElementById('resultTable');
    const resultBody = document.getElementById('resultBody');
    const fontSelector = document.getElementById('fontSelector');
    const sizeSelector = document.getElementById('sizeSelector');
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const resultCount = document.getElementById('resultCount');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    const pageSizeSelect = document.getElementById('pageSizeSelect');

    let currentFontClass = 'font-default';
    let currentSizeClass = 'size-large';
    let filteredData = [...TABLE_DATA];
    let currentPage = 1;
    let pageSize = 100;

    // Apply default size class
    if (resultTable) resultTable.className = currentSizeClass;

    // Font selection change handler
    fontSelector.addEventListener('change', (e) => {
        const val = e.target.value;
        currentFontClass = `font-${val}`;
        renderTable();
    });

    // Size selection change handler
    if (sizeSelector) {
        sizeSelector.addEventListener('change', (e) => {
            currentSizeClass = e.target.value;
            if (resultTable) resultTable.className = currentSizeClass;
        });
    }

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
        const query = searchInput.value.trim().toLowerCase();
        const normQuery = normalizeQuery(query);
        
        if (query) {
            clearSearch.style.display = 'block';
            filteredData = TABLE_DATA.filter(item => {
                const wordLower = item.word ? item.word.toLowerCase() : '';
                const normWord = normalizeQuery(wordLower);
                const wordMatch = wordLower.includes(query) || (normQuery && normWord.includes(normQuery));
                const numMatch = item.num && item.num.toLowerCase().includes(query);
                const signMatch = item.sign && item.sign.includes(query);
                return wordMatch || numMatch || signMatch;
            });
        } else {
            clearSearch.style.display = 'none';
            filteredData = [...TABLE_DATA];
        }

        currentPage = 1;
        renderTable();
    }

    searchInput.addEventListener('input', handleSearch);

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        handleSearch();
        searchInput.focus();
    });

    // Pagination size change handler
    pageSizeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'all') {
            pageSize = filteredData.length || 1;
        } else {
            pageSize = parseInt(val, 10);
        }
        currentPage = 1;
        renderTable();
    });

    // Page navigation buttons
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Render table rows
    function renderTable() {
        resultBody.innerHTML = '';
        
        const totalItems = filteredData.length;
        resultCount.textContent = `عدد النتائج: ${totalItems.toLocaleString('ar-EG')} / ${TABLE_DATA.length.toLocaleString('ar-EG')}`;

        if (totalItems === 0) {
            const tr = document.createElement('tr');
            tr.className = 'empty-state';
            tr.innerHTML = '<td colspan="3">لم يتم العثور على نتائج تطابق البحث</td>';
            resultBody.appendChild(tr);
            pageInfo.textContent = 'الصفحة 0 من 0';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = pageSizeSelect.value === 'all' ? totalItems : Math.min(startIdx + pageSize, totalItems);
        const pageItems = filteredData.slice(startIdx, endIdx);

        pageInfo.textContent = `الصفحة ${currentPage} من ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        const fragment = document.createDocumentFragment();

        pageItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            // Col 1: Cuneiform Sign (Far Right in RTL)
            const tdSign = document.createElement('td');
            tdSign.className = `col-sign cuneiform-text ${currentFontClass}`;
            if (item.sign) {
                tdSign.textContent = item.sign;
            } else {
                tdSign.textContent = '-';
                tdSign.style.color = '#95a5a6';
            }

            // Col 2: Sign Number (Middle)
            const tdNum = document.createElement('td');
            tdNum.className = 'col-num';
            tdNum.textContent = item.num || (startIdx + index + 1);

            // Col 3: Latin Name (Far Left in RTL)
            const tdName = document.createElement('td');
            tdName.className = 'col-name';
            tdName.textContent = item.word;

            tr.appendChild(tdSign);
            tr.appendChild(tdNum);
            tr.appendChild(tdName);

            fragment.appendChild(tr);
        });

        resultBody.appendChild(fragment);
    }

    // Initial render
    renderTable();
});

