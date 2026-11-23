const benefits = [
  [
    '01',
    'Encontre sua inspiração',
    'Conheça os professores, suas experiências e as aulas que oferecem.',
  ],
  [
    '02',
    'Reserve seu momento',
    'Escolha uma aula e combine o melhor horário para aprender.',
  ],
  [
    '03',
    'Compartilhe descobertas',
    'Aprenda, avalie sua experiência e continue explorando.',
  ],
];
export default function HomeBenefits() {
  return (
    <section
      className="benefits"
      id="beneficios"
      aria-label="Aprender na EduLivre"
    >
      {benefits.map(([number, title, description]) => (
        <article className="benefit_card" key={number}>
          <span className="index-number">{number}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </article>
      ))}
    </section>
  );
}
