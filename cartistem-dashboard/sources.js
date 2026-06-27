/*
 * 논문 원문 연결 정보(sources)
 * - pmid: PubMed 링크 (https://pubmed.ncbi.nlm.nih.gov/<pmid>/)
 * - doi : 출판사 원문 링크 (https://doi.org/<doi>) — 각 논문 원문에서 추출한 고유 DOI
 * - pdf : 대시보드에 첨부한 PDF 원문(유료/미연결 논문도 직접 내려받을 수 있도록 전 논문 첨부)
 * 모든 PMID/DOI는 원문에 기재된 값에서 추출하였다(추측 금지).
 * PubMed·DOI 링크는 연결 가능 시 그대로 제공하고, 추가로 PDF 다운로드를 함께 제공한다.
 */
window.SOURCES = {
  p1:  { pdf: "pdfs/p1.pdf", note: "공개 전문 링크 미확인 — PDF 첨부" },
  p2:  { pmid: "28191757", doi: "10.5966/sctm.2016-0157", pdf: "pdfs/p2.pdf" },
  p3:  { pmid: "28148266", doi: "10.1186/s12891-017-1422-7", pdf: "pdfs/p3.pdf" },
  p4:  { pmid: "31443940", doi: "10.1016/j.knee.2019.07.017", pdf: "pdfs/p4.pdf" },
  p5:  { pmid: "32742568", doi: "10.4252/wjsc.v12.i6.514", pdf: "pdfs/p5.pdf" },
  p6:  { pmid: "31988992", doi: "10.1016/j.reth.2019.10.003", pdf: "pdfs/p6.pdf" },
  p7:  { pmid: "31980879", doi: "10.1007/s00402-020-03349-y", pdf: "pdfs/p7.pdf" },
  p8:  { pmid: "31700204", doi: "10.1016/j.jcot.2019.03.025", pdf: "pdfs/p8.pdf" },
  p9:  { pmid: "33068146", doi: "10.1007/s00264-020-04852-y", pdf: "pdfs/p9.pdf" },
  p10: { pmid: "32713192", doi: "10.1177/0963689720943581", pdf: "pdfs/p10.pdf" },
  p11: { pmid: "33621649", doi: "10.1016/j.arthro.2021.02.022", pdf: "pdfs/p11.pdf" },
  p13: { pmid: "33492407", doi: "10.1007/s00167-021-06450-w", pdf: "pdfs/p13.pdf" },
  p14: { pmid: "35004157", doi: "10.1016/j.eats.2021.08.022", pdf: "pdfs/p14.pdf" },
  p15: { doi: "10.1016/j.jcjp.2021.100037", pdf: "pdfs/p15.pdf" },
  p16: { pmid: "34536766", doi: "10.1016/j.knee.2021.08.028", pdf: "pdfs/p16.pdf" },
  p17: { pmid: "36557003", doi: "10.3390/medicina58121801", pdf: "pdfs/p17.pdf" },
  p18: { pmid: "36579106", doi: "10.12998/wjcc.v10.i34.12665", pdf: "pdfs/p18.pdf" },
  p19: { pmid: "36676772", doi: "10.3390/medicina59010148", pdf: "pdfs/p19.pdf" },
  p20: { pmid: "36136263", doi: "10.1007/s40258-022-00762-9", pdf: "pdfs/p20.pdf" },
  p21: { doi: "10.14517/aosm23001", pdf: "pdfs/p21.pdf", note: "Open Access" },
  p22: { pmid: "37654868", doi: "10.1016/j.eats.2023.04.004", pdf: "pdfs/p22.pdf" },
  p23: { pmid: "36984635", doi: "10.3390/medicina59030634", pdf: "pdfs/p23.pdf" },
  p24: { pmid: "37123990", doi: "10.1177/23259671231158391", pdf: "pdfs/p24.pdf" },
  p25: { pmid: "38549124", doi: "10.1186/s43019-024-00221-w", pdf: "pdfs/p25.pdf" },
  p26: { pmid: "38336978", doi: "10.1038/s41598-024-53598-9", pdf: "pdfs/p26.pdf" },
  p27: { pmid: "38426617", doi: "10.1002/ksa.12100", pdf: "pdfs/p27.pdf" },
  p29: { pmid: "39900334", doi: "10.1016/j.otsr.2025.104179", pdf: "pdfs/p29.pdf" },
  p30: { pmid: "40296133", doi: "10.1186/s13287-025-04356-9", pdf: "pdfs/p30.pdf" },
  x_lat:  { doi: "10.1007/s00167-022-06864-0", pdf: "pdfs/x_lat.pdf" },
  x_mri:  { doi: "10.3390/app11041552", pdf: "pdfs/x_mri.pdf" },
  x_meas: { doi: "10.1177/1947603510388028", pdf: "pdfs/x_meas.pdf" }
};
