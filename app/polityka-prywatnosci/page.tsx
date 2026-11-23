import type { Metadata } from "next";
import Link from "next/link";
import { IS_PRODUCTION } from "@/lib/site";
import { InfoPage, Todo } from "@/components/forms/info-page";
import { LEGAL_EFFECTIVE_DATE, OPERATOR } from "@/lib/legal/operator";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  alternates: { canonical: "/polityka-prywatnosci" },
  // Szkic prawny: nieindeksowany do czasu akceptacji prawnika.
  robots: { index: false, follow: IS_PRODUCTION },
};

/** Data wersji roboczej (gdy LEGAL_EFFECTIVE_DATE nie jest ustawione). */
const VERSION_DATE = "22.11.2026";
const fmtDate = (iso: string) => iso.split("-").reverse().join(".");

function OperatorIdentity() {
  return (
    <>
      {OPERATOR.legalName ?? <>{OPERATOR.shortName} <Todo>pełna nazwa spółki z formą prawną</Todo></>}, z siedzibą:{" "}
      {OPERATOR.registeredAddress ?? <Todo>adres siedziby</Todo>}, NIP: {OPERATOR.nip ?? <Todo>NIP</Todo>}
      {OPERATOR.krs ? <>, KRS: {OPERATOR.krs}</> : null}
    </>
  );
}

function OperatorEmail() {
  return OPERATOR.contactEmail ? (
    <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a>
  ) : (
    <Todo>adres e-mail usługodawcy</Todo>
  );
}

export default function PolitykaPrywatnosci() {
  return (
    <InfoPage
      title="Polityka prywatności"
      crumb="Polityka prywatności"
      updated={LEGAL_EFFECTIVE_DATE ? fmtDate(LEGAL_EFFECTIVE_DATE) : VERSION_DATE}
    >
      {LEGAL_EFFECTIVE_DATE ? (
        <p className="text-sm text-ink-muted">Polityka prywatności obowiązuje od {fmtDate(LEGAL_EFFECTIVE_DATE)}.</p>
      ) : (
        <p className="text-sm text-ink-muted">Wersja z dnia {VERSION_DATE} — dokument przygotowany do weryfikacji prawnej.</p>
      )}

      <p>
        Ta polityka wyjaśnia, jakie dane osobowe przetwarzamy w serwisie ZOO24 (zoo24.pl), w jakim celu, na jakiej podstawie i jak długo, oraz jakie prawa Ci przysługują. Stosujemy rozporządzenie (UE) 2016/679 (RODO). Zbieramy możliwie mało danych: serwis nie wymaga konta, nie używa cookies analitycznych ani marketingowych i nie korzysta z zewnętrznych narzędzi śledzących.
      </p>

      <h2>1. Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest <OperatorIdentity /> (dalej: „my”, „Administrator”). Kontakt w sprawach danych osobowych: e-mail <OperatorEmail /> lub{" "}
        <Link href="/kontakt?temat=dane_osobowe">formularz kontaktowy, temat „Dane osobowe (RODO)”</Link>. Nie wyznaczyliśmy inspektora ochrony danych — nie mamy takiego obowiązku.
      </p>

      <h2>2. Jakie dane przetwarzamy, w jakim celu i na jakiej podstawie</h2>
      <h3>Formularz „Dodaj firmę”</h3>
      <ul>
        <li><strong>Dane:</strong> publiczne dane firmy (nazwa, rodzaj usług, miejscowość, strona www, telefon firmowy, zakres usług) oraz e-mail osoby zgłaszającej i jej rola (właściciel lub upoważniony pracownik).</li>
        <li><strong>Cel:</strong> rozpatrzenie zgłoszenia, weryfikacja uprawnień zgłaszającego, kontakt w sprawie zgłoszenia, a po akceptacji — publikacja profilu firmy w katalogu.</li>
        <li><strong>Podstawa:</strong> art. 6 ust. 1 lit. b RODO (obsługa zgłoszenia na zasadach <Link href="/regulamin">regulaminu</Link>) oraz art. 6 ust. 1 lit. f RODO — nasz prawnie uzasadniony interes w weryfikacji, czy zgłoszenie pochodzi od osoby uprawnionej, i w prowadzeniu rzetelnego katalogu.</li>
        <li>E-mail zgłaszającego nigdy nie jest publikowany. Podanie danych jest dobrowolne, ale bez nich nie rozpatrzymy zgłoszenia.</li>
      </ul>

      <h3>Dane firm prezentowane w katalogu</h3>
      <ul>
        <li>Jeżeli firmę prowadzi osoba fizyczna (np. jednoosobowa działalność gospodarcza), jej imię i nazwisko zawarte w nazwie firmy, telefon firmowy, strona www i miejscowość mogą stanowić dane osobowe.</li>
        <li><strong>Źródło:</strong> dane podane przez samą firmę w zgłoszeniu albo informacje, które firma sama publicznie udostępnia (przede wszystkim jej strona internetowa). Przy profilu wskazujemy źródło i datę sprawdzenia. Nie kopiujemy automatycznie baz map ani innych katalogów.</li>
        <li><strong>Cel i podstawa:</strong> informowanie użytkowników o dostępnych usługach dla zwierząt — art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes Administratora i użytkowników), a w przypadku profilu zgłoszonego przez firmę także art. 6 ust. 1 lit. b RODO.</li>
        <li>Pokazujemy wyłącznie dane służbowe. Adres pokazujemy tylko wtedy, gdy jest to adres miejsca prowadzenia działalności publikowany przez samą firmę. Przedsiębiorca może w każdej chwili zażądać poprawienia lub usunięcia profilu albo wnieść sprzeciw — profil wówczas usuwamy, chyba że przepisy wymagają inaczej.</li>
      </ul>

      <h3>Formularz „Zgłoś błąd” (w tym zgłoszenia nielegalnych treści)</h3>
      <ul>
        <li><strong>Dane:</strong> adres strony, treść zgłoszenia oraz — opcjonalnie — e-mail.</li>
        <li><strong>Cel:</strong> poprawienie błędów w serwisie, rozpatrzenie zgłoszenia nielegalnej treści, kontakt w razie potrzeby doprecyzowania.</li>
        <li><strong>Podstawa:</strong> art. 6 ust. 1 lit. f RODO (interes w rzetelności treści) oraz art. 6 ust. 1 lit. c RODO — w zakresie obowiązków z rozporządzenia (UE) 2022/2065 (akt o usługach cyfrowych) dotyczących rozpatrywania zgłoszeń i uzasadniania decyzji.</li>
        <li>Prosimy nie wpisywać w treści zgłoszenia danych osobowych, które nie są potrzebne do jego rozpatrzenia.</li>
      </ul>

      <h3>Formularz kontaktowy i korespondencja e-mail</h3>
      <ul>
        <li><strong>Dane:</strong> temat, treść wiadomości, e-mail oraz dane, które sam(a) podasz w treści.</li>
        <li><strong>Cel:</strong> udzielenie odpowiedzi, obsługa reklamacji, odwołań i wniosków dotyczących danych osobowych.</li>
        <li><strong>Podstawa:</strong> art. 6 ust. 1 lit. f RODO (interes w odpowiadaniu na korespondencję), art. 6 ust. 1 lit. b RODO (reklamacje dotyczące usług serwisu) oraz art. 6 ust. 1 lit. c RODO (obsługa wniosków o realizację praw z RODO i odwołań wymaganych przez akt o usługach cyfrowych).</li>
        <li>Na wiadomości odpowiadamy ze skrzynki pocztowej Administratora.</li>
      </ul>

      <h3>Status zgłoszenia</h3>
      <p>Strona <Link href="/status-zgloszenia">Status zgłoszenia</Link> pokazuje po kodzie wyłącznie rodzaj zgłoszenia, jego status, daty i ewentualne uzasadnienie decyzji — bez e-maili, telefonów i treści zgłoszenia. Z uzasadnienia usuwamy adresy e-mail i numery telefonów.</p>

      <h3>Dochodzenie i obrona roszczeń</h3>
      <p>W razie sporu możemy przetwarzać dane ze zgłoszeń i korespondencji w celu ustalenia, dochodzenia lub obrony roszczeń — art. 6 ust. 1 lit. f RODO.</p>

      <h3>Pomiar zbiorczy (bez danych osobowych)</h3>
      <p>Zliczamy kliknięcia „Zadzwoń” i „Strona firmy”, przejścia z poradników do katalogu oraz wyszukiwania w katalogu wyłącznie jako dzienne sumy dla danej strony lub firmy. Nie używamy przy tym cookies, nie zapisujemy adresu IP ani identyfikatorów urządzeń czy użytkowników. Takie zbiorcze liczby nie pozwalają zidentyfikować osoby, dlatego nie są danymi osobowymi.</p>

      <h2>3. Bezpieczeństwo i ochrona przed nadużyciami</h2>
      <ul>
        <li>Formularze chroni ukryte pole antyspamowe i limit liczby zgłoszeń (5 zgłoszeń w ciągu 10 minut). Do limitu używamy skrótu (hash SHA-256) z dwóch technicznych nagłówków przeglądarki (identyfikator przeglądarki i preferowany język). Skrót jest przechowywany wyłącznie w pamięci serwera przez najwyżej 10 minut i nie jest zapisywany w bazie. Aplikacja nie zapisuje adresu IP. Podstawa: art. 6 ust. 1 lit. f RODO (bezpieczeństwo serwisu).</li>
        <li>Dostawca hostingu, jak każdy serwer WWW, technicznie przetwarza adres IP i podstawowe dane żądania, aby dostarczyć stronę i chronić infrastrukturę przed atakami — w zakresie i przez okres określony w jego zasadach (art. 6 ust. 1 lit. f RODO).</li>
        <li>Dostęp do zgłoszeń mają wyłącznie upoważnione osoby moderujące. Dziennik zdarzeń moderacji nie zawiera danych osobowych.</li>
        <li>Nie podejmujemy decyzji w sposób zautomatyzowany ani nie profilujemy użytkowników.</li>
      </ul>

      <h2>4. Odbiorcy danych</h2>
      <p>Dane powierzamy wyłącznie podmiotom przetwarzającym, które działają na nasze polecenie na podstawie umów powierzenia (art. 28 RODO):</p>
      <ul>
        <li><strong>Vercel Inc.</strong> — hosting serwisu; funkcje serwerowe działają w regionie Frankfurt (Niemcy).</li>
        <li><strong>Supabase Inc.</strong> — baza danych, w której przechowujemy zgłoszenia; region eu-central-1 (Frankfurt, Niemcy).</li>
        <li>Dostawca usługi poczty elektronicznej Administratora — w zakresie korespondencji e-mail.</li>
      </ul>
      <p>Dane możemy przekazać także organom publicznym, jeżeli wymagają tego przepisy prawa. Nie sprzedajemy danych, nie udostępniamy ich w celach marketingowych i nie kupujemy ani nie importujemy baz danych osobowych.</p>

      <h2>5. Przekazywanie danych poza Europejski Obszar Gospodarczy</h2>
      <p>
        Dane przechowujemy w centrach danych we Frankfurcie. Vercel Inc. i Supabase Inc. są spółkami z siedzibą w USA, dlatego nie można wykluczyć dostępu do danych z USA (np. przy obsłudze technicznej). W takim przypadku przekazanie odbywa się na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony w ramach EU-US Data Privacy Framework (w odniesieniu do certyfikowanych podmiotów) lub standardowych klauzul umownych zatwierdzonych przez Komisję Europejską (art. 46 ust. 2 lit. c RODO). Kopię zabezpieczeń możesz otrzymać, kontaktując się z nami.
      </p>

      <h2>6. Okres przechowywania</h2>
      <ul>
        <li><strong>Zgłoszenia firm</strong> (w tym e-mail zgłaszającego): do zakończenia moderacji, a następnie przez 12 miesięcy — na wypadek pytań, odwołań lub ponownej weryfikacji.</li>
        <li><strong>Dane firm w opublikowanym profilu:</strong> przez czas prezentowania profilu w katalogu; po usunięciu profilu — do 12 miesięcy w dokumentacji moderacji.</li>
        <li><strong>Zgłoszenia błędów i nielegalnych treści:</strong> 12 miesięcy od rozpatrzenia zgłoszenia.</li>
        <li><strong>Wiadomości z formularza kontaktowego i korespondencja e-mail:</strong> 12 miesięcy od ostatniej wiadomości w sprawie.</li>
        <li><strong>Skrót nagłówków do limitu zgłoszeń:</strong> najwyżej 10 minut, wyłącznie w pamięci serwera.</li>
      </ul>
      <p>Jeżeli dane są potrzebne do ustalenia, dochodzenia lub obrony roszczeń albo wymaga tego prawo, przechowujemy je dłużej — do zakończenia sprawy lub upływu terminu przedawnienia. Po upływie okresu przechowywania dane usuwamy lub anonimizujemy.</p>

      <h2>7. Twoje prawa</h2>
      <p>Masz prawo do:</p>
      <ul>
        <li>dostępu do swoich danych i otrzymania ich kopii (art. 15 RODO);</li>
        <li>sprostowania danych (art. 16 RODO);</li>
        <li>usunięcia danych (art. 17 RODO);</li>
        <li>ograniczenia przetwarzania (art. 18 RODO);</li>
        <li>przenoszenia danych — w zakresie danych przetwarzanych na podstawie art. 6 ust. 1 lit. b RODO (art. 20 RODO);</li>
        <li>sprzeciwu wobec przetwarzania opartego na art. 6 ust. 1 lit. f RODO — z przyczyn związanych z Twoją szczególną sytuacją (art. 21 RODO).</li>
      </ul>
      <p>
        Aby skorzystać z praw, napisz na adres <OperatorEmail /> lub przez <Link href="/kontakt?temat=dane_osobowe">formularz kontaktowy</Link>. Odpowiemy bez zbędnej zwłoki, nie później niż w ciągu miesiąca. Możemy poprosić o informacje potrzebne do potwierdzenia, że wniosek dotyczy Twoich danych (np. kod zgłoszenia lub wiadomość z adresu e-mail podanego w zgłoszeniu).
      </p>
      <p>
        Masz także prawo wnieść skargę do organu nadzorczego — Prezesa Urzędu Ochrony Danych Osobowych (<a href="https://uodo.gov.pl" rel="noopener noreferrer">uodo.gov.pl</a>).
      </p>

      <h2>8. Cookies i podobne technologie</h2>
      <p>
        Serwis nie zapisuje w przeglądarkach odwiedzających cookies analitycznych, marketingowych ani innych plików cookie i nie korzysta z zewnętrznych narzędzi śledzących, pikseli reklamowych ani wtyczek społecznościowych. Czcionki są serwowane z naszego serwera, a nie od zewnętrznych dostawców. Jedyny plik cookie jest ściśle techniczny i dotyczy wyłącznie panelu administracyjnego, z którego korzystają osoby moderujące. Dlatego nie wyświetlamy banera zgody na cookies. Jeżeli w przyszłości wprowadzimy narzędzia wymagające zgody, najpierw zaktualizujemy tę politykę i poprosimy o zgodę.
      </p>

      <h2>9. Fanpage na Facebooku i konto na Instagramie</h2>
      <p>
        Prowadzimy profile ZOO24 w serwisach Facebook i Instagram. Przy korzystaniu z nich dane przetwarza przede wszystkim Meta Platforms Ireland Limited (Irlandia) na własnych zasadach opisanych w jej polityce prywatności. W zakresie statystyk strony (Page Insights) — zbiorczych danych o tym, jak użytkownicy korzystają z naszego profilu — jesteśmy z Meta Platforms Ireland Limited współadministratorami danych (art. 26 RODO). Zasady współadministrowania określa{" "}
        <a href="https://www.facebook.com/legal/terms/page_controller_addendum" rel="noopener noreferrer">porozumienie Meta dotyczące statystyk strony</a>. Meta odpowiada za realizację obowiązków informacyjnych i praw osób w zakresie danych do statystyk; wnioski możesz kierować bezpośrednio do Meta albo do nas — przekażemy je. Statystyki otrzymujemy wyłącznie w formie zbiorczej i wykorzystujemy je do oceny, które treści są przydatne (art. 6 ust. 1 lit. f RODO). Na wiadomości prywatne i komentarze odpowiadamy w tych serwisach; nie kopiujemy ich do naszych materiałów.
      </p>

      <h2>10. Zmiany polityki</h2>
      <p>
        Politykę aktualizujemy, gdy zmieniają się przepisy, sposób działania serwisu lub nasi dostawcy. Nowa wersja jest publikowana na tej stronie z datą aktualizacji. O istotnych zmianach — np. nowych celach przetwarzania lub nowych kategoriach odbiorców — informujemy dodatkowo komunikatem w serwisie przed ich wprowadzeniem.
      </p>
    </InfoPage>
  );
}
