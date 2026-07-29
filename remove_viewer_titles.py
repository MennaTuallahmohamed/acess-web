from pathlib import Path

replacements = {
    'src/pages/monitoring/ViewerDevicesPage.jsx': (
        "        <div className=\"dev-topbar\">\n          <div>\n            <div className=\"dev-topbar__title\">\n              {t(\"Device Operations\", \"إدارة الأجهزة\")}\n            </div>\n\n            <div className=\"dev-topbar__sub\">\n",
        "        <div className=\"dev-topbar\">\n          <div />\n"
    ),
    'src/pages/monitoring/ViewerInspectionsPage.jsx': (
        "        <div className=\"insp-topbar\">\n          <div>\n            <div className=\"insp-topbar__title\">\n              {t(\"Inspection Records\", \"سجل الفحوصات\")}\n            </div>\n\n            <div className=\"insp-topbar__sub\">\n",
        "        <div className=\"insp-topbar\">\n          <div />\n"
    ),
    'src/pages/monitoring/ViewerHomePage.jsx': (
        "            <div className=\"vh__topbar\">\n              <div>\n                <div className=\"vh__title\">\n                  {lang === \"ar\" ? \"نظرة عامة على التشغيل\" : \"Operational Overview\"}\n                </div>\n                <div className=\"vh__page-sub\">\n",
        "            <div className=\"vh__topbar\">\n              <div />\n"
    ),
    'src/pages/monitoring/ViewerAnalyticsPage.jsx': (
        "        <div className=\"an-topbar\">\n          <div>\n            <div className=\"an-topbar__title\">{t(\"Operational Analytics\", \"تحليلات التشغيل\")}</div>\n            <div className=\"an-topbar__sub\">\n",
        "        <div className=\"an-topbar\">\n          <div />\n"
    ),
    'src/pages/monitoring/ViewerLocationsPage.jsx': (
        "        <div className=\"loc-topbar\">\n          <div>\n            <div className=\"loc-subtitle\">\n",
        "        <div className=\"loc-topbar\">\n          <div />\n"
    ),
}

for path_str, (old, new) in replacements.items():
    path = Path(path_str)
    if not path.exists():
        print(f'MISSING: {path_str}')
        continue
    text = path.read_text(encoding='utf-8')
    if old not in text:
        print(f'PATTERN NOT FOUND: {path_str}')
        continue
    path.write_text(text.replace(old, new, 1), encoding='utf-8')
    print(f'UPDATED: {path_str}')
