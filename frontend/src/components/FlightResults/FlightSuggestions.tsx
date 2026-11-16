import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FlightSuggestion, getFlightSuggestions } from '../../services/niraApi';

interface FlightSuggestionsProps {
  origin: string;
  destination: string;
  departureDate: string;
  originLabel: string;
}

function formatDate(iso: string, language: string) {
  const parts = iso.split('-').map(Number);
  if (parts.length < 3 || parts.some((part) => !part)) return iso;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const locale = language === 'en' ? 'en-GB' : language === 'ar' ? 'ar' : 'fa-IR';
  return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' });
}

function formatPrice(price: number, language: string) {
  if (language === 'en') return price.toLocaleString('en-US');
  if (language === 'ar') return price.toLocaleString('ar-SA');
  return price.toLocaleString('fa-IR');
}

function cityLabel(card: FlightSuggestion, code: 'origin' | 'destination', language: string) {
  if (language === 'en') {
    return code === 'origin' ? card.origin_en : card.destination_en;
  }
  return code === 'origin' ? card.origin_fa : card.destination_fa;
}

const SuggestionCard: React.FC<{ card: FlightSuggestion }> = ({ card }) => {
  const { t, language } = useLanguage();
  const font = { fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' as const : 'rtl' as const };
  const badge = card.direction === 'reverse' ? t('flights.suggest.returnBadge') : card.direction === 'same' ? t('flights.suggest.sameBadge') : '';

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-900" style={font}>
          {formatDate(card.date, language)}
        </span>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900" style={font}>
          {t('flights.suggest.closed')}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-gray-900" dir="ltr">
        <span className="text-base font-bold" style={font}>{cityLabel(card, 'origin', language)}</span>
        <span className="text-blue-900" aria-hidden="true">→</span>
        <span className="text-base font-bold" style={font}>{cityLabel(card, 'destination', language)}</span>
      </div>
      <div className="mt-1 text-sm text-gray-500" style={font}>
        {card.flight_no}
        {badge ? ` · ${badge}` : ''}
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-blue-100 pt-3">
        <div className="shrink-0 text-sm font-bold text-gray-800" dir="ltr">
          {card.departure_time || '—'}
          {card.arrival_time ? ` – ${card.arrival_time}` : ''}
        </div>
        {card.price > 0 ? (
          <div className="shrink-0 text-left" dir="ltr">
            <div className="whitespace-nowrap text-base font-bold text-blue-900" style={font}>{formatPrice(card.price, language)}</div>
            <div className="text-xs text-gray-500" style={font}>{t('flights.currency')}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const SuggestionSection: React.FC<{
  title: string;
  text: string;
  cards: FlightSuggestion[];
  emptyText: string;
  tone: 'deep' | 'sky';
}> = ({ title, text, cards, emptyText, tone }) => {
  const { language } = useLanguage();
  const font = { fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' as const : 'rtl' as const };
  const headerClass = tone === 'deep'
    ? 'bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800'
    : 'bg-gradient-to-r from-sky-800 via-blue-800 to-blue-900';

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
      <div className={`${headerClass} px-4 py-4 sm:px-5`}>
        <h2 className="text-lg font-bold text-white sm:text-xl" style={font}>{title}</h2>
        <p className="mt-1 text-sm text-blue-100" style={font}>{text}</p>
      </div>
      <div className="p-4">
        {cards.length === 0 ? (
          <p className="text-sm text-gray-500" style={font}>{emptyText}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cards.map((card) => (
              <SuggestionCard key={`${card.date}-${card.origin}-${card.destination}-${card.flight_no}`} card={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const FlightSuggestions: React.FC<FlightSuggestionsProps> = ({
  origin,
  destination,
  departureDate,
  originLabel,
}) => {
  const { t, language } = useLanguage();
  const [alternate, setAlternate] = useState<FlightSuggestion[]>([]);
  const [otherDestinations, setOtherDestinations] = useState<FlightSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAlternate([]);
    setOtherDestinations([]);

    getFlightSuggestions({
      origin,
      destination,
      departure_date: departureDate,
    }).then((groups) => {
      if (cancelled) return;
      setAlternate(groups.alternate.filter((card) => card.can_book !== true));
      setOtherDestinations(groups.otherDestinations.filter((card) => card.can_book !== true));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, departureDate]);

  const font = { fontFamily: 'DigiHamishe, DigiHamisheBold, sans-serif', direction: language === 'en' ? 'ltr' as const : 'rtl' as const };
  const cityName = originLabel || origin;

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-4 border-blue-900" />
        <p className="text-center text-sm text-gray-600" style={font}>{t('flights.suggest.loading')}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <SuggestionSection
        tone="deep"
        title={t('flights.suggest.otherDaysTitle')}
        text={t('flights.suggest.otherDaysText')}
        cards={alternate}
        emptyText={t('flights.suggest.emptyDays')}
      />
      <SuggestionSection
        tone="sky"
        title={t('flights.suggest.otherCitiesTitle').replace('{city}', cityName)}
        text={t('flights.suggest.otherCitiesText')}
        cards={otherDestinations}
        emptyText={t('flights.suggest.emptyCities')}
      />
    </div>
  );
};

export default FlightSuggestions;
