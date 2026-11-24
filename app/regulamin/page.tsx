import type { Metadata } from "next";
import Link from "next/link";
import { IS_PRODUCTION } from "@/lib/site";
import { InfoPage, Todo } from "@/components/forms/info-page";
import { LEGAL_EFFECTIVE_DATE, OPERATOR } from "@/lib/legal/operator";

export const metadata: Metadata = {
  title: "Regulamin",
  alternates: { canonical: "/regulamin" },
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

export default function Regulamin() {
  return (
    <InfoPage
      title="Regulamin serwisu ZOO24"
      crumb="Regulamin"
      updated={LEGAL_EFFECTIVE_DATE ? fmtDate(LEGAL_EFFECTIVE_DATE) : VERSION_DATE}
    >
      {LEGAL_EFFECTIVE_DATE ? (
        <p className="text-sm text-ink-muted">Regulamin obowiązuje od {fmtDate(LEGAL_EFFECTIVE_DATE)}.</p>
      ) : (
        <p className="text-sm text-ink-muted">Wersja z dnia {VERSION_DATE} — dokument przygotowany do weryfikacji prawnej.</p>
      )}

      <h2>§1. Postanowienia ogólne</h2>
      <ol>
        <li>Regulamin określa zasady korzystania z serwisu internetowego ZOO24 dostępnego pod adresem zoo24.pl (dalej: „Serwis”). Jest regulaminem świadczenia usług drogą elektroniczną w rozumieniu ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.</li>
        <li>Usługodawcą i operatorem Serwisu jest <OperatorIdentity /> (dalej: „Usługodawca”). Kontakt z Usługodawcą: <Link href="/kontakt">formularz kontaktowy</Link> lub e-mail: <OperatorEmail />.</li>
        <li>Serwis bezpłatnie udostępnia poradniki dla opiekunów zwierząt oraz katalog usług dla zwierząt (obecnie: groomerzy i hotele dla zwierząt w wybranych miastach Polski).</li>
        <li>Serwis nie prowadzi sprzedaży produktów ani usług, nie pośredniczy w rezerwacjach i płatnościach, nie zawiera umów w imieniu firm z katalogu, nie publikuje ocen ani opinii o firmach i nie udziela porad weterynaryjnych.</li>
        <li>Korzystanie z Serwisu nie wymaga zakładania konta. Regulamin jest dostępny nieodpłatnie na tej stronie w formie, która umożliwia jego pobranie, utrwalenie i wydrukowanie.</li>
      </ol>

      <h2>§2. Definicje</h2>
      <ul>
        <li><strong>Użytkownik</strong> — każda osoba korzystająca z Serwisu, w tym osoba wysyłająca formularz.</li>
        <li><strong>Firma</strong> — przedsiębiorca świadczący usługi dla zwierząt, którego dane są lub mają być prezentowane w katalogu.</li>
        <li><strong>Profil</strong> — opis Firmy w katalogu: m.in. nazwa, rodzaj usług, miejscowość, zakres usług, strona internetowa i telefon firmowy, źródło danych oraz data ich sprawdzenia.</li>
        <li><strong>Zgłoszenie</strong> — informacja przesłana przez formularz „Dodaj firmę”, „Zgłoś błąd” lub formularz kontaktowy. Każde Zgłoszenie otrzymuje kod (np. ZG-ABC234).</li>
        <li><strong>Moderator</strong> — osoba działająca w imieniu Usługodawcy, która rozpatruje Zgłoszenia i podejmuje decyzje dotyczące treści w Serwisie.</li>
        <li><strong>Treść sponsorowana</strong> — treść opublikowana za wynagrodzeniem lub w ramach współpracy afiliacyjnej. Każda taka treść jest wyraźnie oznaczona przy treści (<Link href="/reklama-i-wspolprace">zasady reklamy i współprac</Link>).</li>
        <li><strong>Treść nielegalna</strong> — informacja, która sama w sobie lub przez odniesienie do działania jest niezgodna z prawem Unii Europejskiej lub prawem polskim.</li>
      </ul>

      <h2>§3. Rodzaje usług i zawarcie umowy</h2>
      <ol>
        <li>Usługodawca świadczy nieodpłatnie następujące usługi:
          <ul>
            <li>udostępnianie poradników oraz katalogu Firm wraz z wyszukiwarką i filtrami;</li>
            <li>formularz „Dodaj firmę” — zgłoszenie nowego Profilu albo aktualizacji istniejącego Profilu;</li>
            <li>formularz „Zgłoś błąd” — zgłoszenie nieprawidłowych, nieaktualnych lub nielegalnych treści;</li>
            <li>formularz kontaktowy;</li>
            <li>sprawdzanie statusu Zgłoszenia po kodzie na stronie <Link href="/status-zgloszenia">Status zgłoszenia</Link>.</li>
          </ul>
        </li>
        <li>Umowa o korzystanie z treści Serwisu zostaje zawarta z chwilą otwarcia strony Serwisu, na czas nieokreślony. Użytkownik może ją zakończyć w każdej chwili, przestając korzystać z Serwisu.</li>
        <li>Umowa o obsługę Zgłoszenia zostaje zawarta z chwilą wysłania formularza i wygasa po rozpatrzeniu Zgłoszenia lub udzieleniu odpowiedzi.</li>
        <li>Przed wysłaniem formularza „Dodaj firmę” Użytkownik akceptuje Regulamin i potwierdza zapoznanie się z <Link href="/polityka-prywatnosci">polityką prywatności</Link>.</li>
      </ol>

      <h2>§4. Wymagania techniczne i zasady korzystania</h2>
      <ol>
        <li>Do korzystania z Serwisu potrzebne jest urządzenie z dostępem do internetu i aktualna przeglądarka internetowa. Serwis nie wymaga instalowania dodatkowego oprogramowania.</li>
        <li>Korzystanie z internetu wiąże się z typowymi zagrożeniami (np. złośliwe oprogramowanie, próby wyłudzenia danych). Zalecamy aktualizowanie przeglądarki i systemu. Serwis nigdy nie prosi o hasła ani dane płatnicze.</li>
        <li>Użytkownik zobowiązuje się korzystać z Serwisu zgodnie z prawem, Regulaminem i dobrymi obyczajami. Zabronione jest w szczególności:
          <ul>
            <li>przesyłanie treści nielegalnych, obraźliwych, wprowadzających w błąd lub naruszających prawa osób trzecich (w tym dóbr osobistych, praw autorskich i znaków towarowych);</li>
            <li>podawanie w formularzach danych osobowych osób trzecich bez podstawy prawnej, w szczególności adresów zamieszkania lub prywatnych numerów telefonów;</li>
            <li>podszywanie się pod Firmę lub inną osobę;</li>
            <li>wysyłanie spamu, automatyczne masowe wysyłanie formularzy i działania zakłócające pracę Serwisu;</li>
            <li>automatyczne pobieranie (scraping) zawartości Serwisu w celu tworzenia konkurencyjnych baz danych.</li>
          </ul>
        </li>
        <li>Formularze są chronione zabezpieczeniem antyspamowym i limitem liczby Zgłoszeń w krótkim czasie.</li>
      </ol>

      <h2>§5. Katalog Firm i kolejność wyników</h2>
      <ol>
        <li>Dane Firm pochodzą z informacji publikowanych przez same Firmy (np. na ich stronach internetowych) albo ze Zgłoszeń Firm sprawdzonych przez Moderatora. Przy Profilu podajemy źródło danych i datę ich sprawdzenia. Serwis nie kopiuje automatycznie baz map ani innych katalogów.</li>
        <li>W Profilu prezentujemy wyłącznie dane służbowe. Adres pokazujemy tylko wtedy, gdy jest to adres miejsca prowadzenia działalności, który Firma sama publicznie podaje. Serwis nie publikuje danych przykładowych (demonstracyjnych).</li>
        <li>Oznaczenie „Dane sprawdzone” oznacza wyłącznie zgodność danych ze wskazanym źródłem w dniu sprawdzenia. Nie jest oceną jakości usług ani rekomendacją.</li>
        <li>Profil podstawowy jest bezpłatny. Płatne wyróżnienia są obecnie niedostępne. Ich ewentualne wprowadzenie wymaga wcześniejszej zmiany Regulaminu lub odrębnych warunków. Treści płatne będą zawsze oznaczone etykietą „Reklama · wyróżnienie płatne”.</li>
        <li>Główne parametry kolejności wyników:
          <ul>
            <li>lista obejmuje wyłącznie opublikowane Profile z wybranej kategorii usług i miasta;</li>
            <li>domyślnie Profile są ułożone alfabetycznie według nazwy Firmy (zgodnie z zasadami sortowania w języku polskim);</li>
            <li>Użytkownik może wybrać sortowanie według daty ostatniego sprawdzenia danych — od najnowszej; Profile bez daty sprawdzenia są wtedy na końcu listy, a przy tej samej dacie decyduje kolejność alfabetyczna;</li>
            <li>Użytkownik może zawęzić wyniki filtrami: rodzaj zwierzęcia, zakres usług oraz dostępność strony internetowej lub telefonu.</li>
          </ul>
          Kolejność nie zależy od opłat, liczby kliknięć, ocen ani innych relacji handlowych z Usługodawcą. Serwis nie personalizuje kolejności wyników.
        </li>
        <li>Kliknięcie „Zadzwoń” lub „Strona firmy” prowadzi bezpośrednio do Firmy. Umowa o usługę dla zwierzęcia jest zawierana wyłącznie między Użytkownikiem a Firmą, bez udziału Usługodawcy.</li>
      </ol>

      <h2>§6. Zgłoszenia Firm</h2>
      <ol>
        <li>Zgłoszenie Firmy może wysłać właściciel lub współwłaściciel Firmy albo pracownik upoważniony przez Firmę. Moderator może poprosić o potwierdzenie uprawnień, np. wiadomością wysłaną z adresu e-mail podanego na stronie Firmy.</li>
        <li>Zgłaszający podaje wyłącznie publiczne dane Firmy oraz swój adres e-mail i rolę. Odpowiada za prawdziwość danych i za to, że ma prawo je przekazać.</li>
        <li>E-mail zgłaszającego służy wyłącznie do kontaktu w sprawie Zgłoszenia i nie jest publikowany.</li>
        <li>Usługodawca może odmówić publikacji Profilu, jeżeli dane są niepełne, nieweryfikowalne, nieprawdziwe, nie dotyczą usług dla zwierząt objętych katalogiem albo naruszają Regulamin lub prawo. Brak publikacji nie jest oceną Firmy.</li>
        <li>Firma może w każdej chwili poprosić o aktualizację lub usunięcie swojego Profilu — przez formularz „Dodaj firmę” (aktualizacja) albo <Link href="/kontakt">formularz kontaktowy</Link> (temat „Profil firmy w katalogu”).</li>
      </ol>

      <h2>§7. Moderacja i zgłaszanie nielegalnych treści</h2>
      <ol>
        <li><strong>Punkt kontaktowy.</strong> Pojedynczym punktem kontaktowym dla Użytkowników oraz organów państw członkowskich, Komisji Europejskiej i Europejskiej Rady ds. Usług Cyfrowych (art. 11 i 12 rozporządzenia (UE) 2022/2065 — aktu o usługach cyfrowych, „DSA”) jest adres e-mail: <OperatorEmail /> oraz <Link href="/kontakt">formularz kontaktowy</Link>. Komunikacja odbywa się w języku polskim.</li>
        <li><strong>Zgłoszenie nielegalnej treści.</strong> Każdy może zgłosić treść, którą uważa za nielegalną lub nieprawdziwą, przez <Link href="/zglos-blad">formularz zgłoszenia błędu</Link>. Zgłoszenie powinno zawierać: adres strony z treścią, wyjaśnienie, dlaczego treść jest nielegalna lub nieprawdziwa, oraz — jeśli zgłaszający chce otrzymać odpowiedź — adres e-mail. Zgłaszający powinien działać w dobrej wierze i podawać informacje zgodne z prawdą.</li>
        <li><strong>Potwierdzenie i rozpatrzenie.</strong> Po wysłaniu formularza zgłaszający otrzymuje kod Zgłoszenia, który pozwala sprawdzić jego status na stronie <Link href="/status-zgloszenia">Status zgłoszenia</Link>. Każde Zgłoszenie rozpatruje człowiek — bez decyzji podejmowanych automatycznie — w sposób staranny, niearbitralny i obiektywny, bez zbędnej zwłoki.</li>
        <li><strong>Uzasadnienie decyzji.</strong> Jeżeli Zgłoszenie zostanie odrzucone albo treść zostanie usunięta, ukryta lub ograniczona, Usługodawca podaje uzasadnienie: rodzaj decyzji, okoliczności i fakty, na których się opiera, oraz wskazanie przepisu prawa lub postanowienia Regulaminu. Uzasadnienie jest widoczne na stronie statusu Zgłoszenia, a jeśli podano adres e-mail — może zostać także przesłane e-mailem.</li>
        <li><strong>Odwołanie.</strong> Zgłaszający oraz Firma, której dotyczy decyzja, mogą złożyć odwołanie w terminie 6 miesięcy od decyzji przez <Link href="/kontakt">formularz kontaktowy</Link> lub e-mail, podając kod Zgłoszenia i powody odwołania. Odwołanie rozpatruje człowiek, w miarę możliwości inna osoba niż ta, która podjęła pierwotną decyzję, w terminie 14 dni. Złożenie odwołania nie wyłącza prawa do dochodzenia roszczeń przed sądem ani skorzystania z innych środków prawnych.</li>
        <li>Usługodawca może usunąć lub ukryć treść niezgodną z prawem albo Regulaminem także z własnej inicjatywy. Jeżeli ma wiedzę o treści stanowiącej zagrożenie dla życia lub bezpieczeństwa osób, niezwłocznie powiadamia właściwe organy.</li>
      </ol>

      <h2>§8. Treści Serwisu i odpowiedzialność</h2>
      <ol>
        <li>Poradniki mają charakter ogólny i informacyjny. Nie są poradą weterynaryjną, medyczną ani prawną i nie zastępują konsultacji ze specjalistą. W sprawach zdrowia zwierzęcia skontaktuj się z lekarzem weterynarii. Zasady przygotowywania treści, w tym jawny udział asystenta AI w pracy redakcyjnej, opisują <Link href="/zasady-redakcyjne">zasady redakcyjne</Link>.</li>
        <li>Dane Firm pochodzą z ich własnych źródeł lub od samych Firm. Usługodawca dokłada starań, aby były aktualne, jednak nie gwarantuje ich kompletności ani aktualności po dacie sprawdzenia. Przed skorzystaniem z usługi warto potwierdzić szczegóły bezpośrednio w Firmie.</li>
        <li>Usługodawca nie jest stroną umów zawieranych między Użytkownikami a Firmami i nie odpowiada za jakość, cenę, dostępność ani sposób świadczenia usług przez Firmy.</li>
        <li>Usługodawca nie odpowiada za treść stron internetowych Firm i innych stron zewnętrznych, do których prowadzą linki.</li>
        <li>Usługodawca może czasowo ograniczyć dostęp do Serwisu z powodu prac technicznych, awarii lub ze względów bezpieczeństwa.</li>
        <li>Postanowienia niniejszego paragrafu nie wyłączają ani nie ograniczają odpowiedzialności Usługodawcy w zakresie, w jakim nie może być ona wyłączona lub ograniczona zgodnie z bezwzględnie obowiązującymi przepisami prawa, w szczególności wobec konsumentów.</li>
        <li>Treści Serwisu (teksty, układ, grafiki) są chronione prawem autorskim. Część ilustracji w Serwisie wygenerowano z użyciem narzędzi AI; nie przedstawiają one rzeczywistych osób, firm ani konkretnych zwierząt. Kopiowanie treści w celach innych niż dozwolony użytek osobisty lub prawo cytatu wymaga zgody Usługodawcy.</li>
      </ol>

      <h2>§9. Reklamacje dotyczące Serwisu</h2>
      <ol>
        <li>Reklamacje dotyczące działania Serwisu lub usług Usługodawcy można składać przez <Link href="/kontakt">formularz kontaktowy</Link> albo e-mailem na adres: <OperatorEmail />.</li>
        <li>Reklamacja powinna zawierać adres e-mail do odpowiedzi, opis problemu oraz — w miarę możliwości — adres strony, której dotyczy, i datę wystąpienia problemu.</li>
        <li>Usługodawca rozpatruje reklamację i odpowiada na nią w terminie 14 dni od jej otrzymania, na adres e-mail podany w reklamacji. Jeżeli reklamacja wymaga uzupełnienia, Usługodawca poprosi o nie, a termin biegnie od otrzymania uzupełnienia.</li>
        <li>Użytkownik będący konsumentem może skorzystać z pozasądowych sposobów rozpatrywania sporów, np. pomocy miejskiego lub powiatowego rzecznika konsumentów lub inspekcji handlowej.</li>
      </ol>

      <h2>§10. Dane osobowe</h2>
      <p>Zasady przetwarzania danych osobowych, w tym okresy przechowywania i prawa osób, których dane dotyczą, opisuje <Link href="/polityka-prywatnosci">polityka prywatności</Link>.</p>

      <h2>§11. Postanowienia końcowe</h2>
      <ol>
        <li>Usługodawca może zmienić Regulamin z ważnych przyczyn, w szczególności zmiany przepisów prawa, zakresu usług Serwisu, wymogów bezpieczeństwa lub decyzji organów. O zmianie informujemy na tej stronie i komunikatem w Serwisie co najmniej 7 dni przed jej wejściem w życie. Zgłoszenia złożone przed zmianą rozpatrujemy według dotychczasowych zasad.</li>
        <li>Wcześniejsze wersje Regulaminu udostępniamy na prośbę przesłaną przez formularz kontaktowy.</li>
        <li>Regulamin podlega prawu polskiemu. Wybór prawa nie pozbawia konsumenta ochrony przyznanej mu przez bezwzględnie obowiązujące przepisy prawa państwa jego zwykłego pobytu.</li>
        <li>Spory rozstrzyga sąd właściwy według przepisów ogólnych.</li>
        <li>Regulamin wchodzi w życie z dniem: {LEGAL_EFFECTIVE_DATE ? fmtDate(LEGAL_EFFECTIVE_DATE) : <Todo>data wejścia w życie</Todo>}.</li>
      </ol>
    </InfoPage>
  );
}
