import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SimilarCase from '../src/models/SimilarCase.js';
import config from '../src/config/env.js';
dotenv.config();

let embeddingsAvailable = false;
let genAI = null;

if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  embeddingsAvailable = true;
  console.log('Gemini API key found. Will generate embeddings.');
} else {
  console.log('No Gemini API key. Seeding without embeddings.');
}

async function generateEmbedding(text) {
  if (!embeddingsAvailable || !genAI) return null;
  try {
    const truncated = text.slice(0, 8000);
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(truncated);
    return result.embedding.values;
  } catch (err) {
    console.log(`  Embedding failed (${err.message}). Continuing without embeddings.`);
    embeddingsAvailable = false;
    return null;
  }
}

// 20 Real landmark Indian legal cases
const cases = [
  {
    caseReference: 'AIR 1973 SC 1461',
    title: 'Kesavananda Bharati v. State of Kerala',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1973,
    summary: 'The Supreme Court established the Basic Structure Doctrine, holding that while Parliament has wide powers to amend the Constitution under Article 368, it cannot alter the basic structure or framework of the Constitution. The court ruled that fundamental rights, federalism, secularism, separation of powers, and judicial review form part of the basic structure. This landmark case arose when Kesavananda Bharati, head of a religious mutt in Kerala, challenged the Kerala government\'s restrictions on management of religious property under land reform laws.',
    outcome: 'Petition partially allowed. The court held that Parliament can amend any part of the Constitution but cannot destroy its basic structure. The 24th, 25th, and 29th Constitutional Amendments were upheld with limitations.',
    keyLaws: ['Article 368 of the Constitution', 'Article 14', 'Article 19', 'Article 31', '24th Amendment', '25th Amendment', '29th Amendment'],
    fullText: 'Kesavananda Bharati Sripadagalvaru v. State of Kerala is a landmark decision of the Supreme Court of India that outlined the Basic Structure doctrine of the Constitution. The case was heard by the largest Constitutional Bench of 13 judges in the history of the Supreme Court. His Holiness Kesavananda Bharati, the head of the Edneer Mutt, a Hindu monastery in Kasaragod, Kerala, filed a petition under Article 26 challenging the Kerala government land reform legislation that restricted the management and administration of religious property. The petitioner argued that these laws violated his fundamental rights under Articles 14, 19, 25, 26, and 31 of the Constitution. The case evolved into a broader constitutional question about the extent of Parliament\'s amending power under Article 368. By a margin of 7-6, the court held that while Parliament has wide powers to amend the Constitution, it cannot alter the basic structure. Fundamental rights to equality before the law, right to life and personal liberty, federalism, secularism, separation of powers, free and fair elections, and judicial review were held to be part of the basic structure.',
  },
  {
    caseReference: 'AIR 1978 SC 597',
    title: 'Maneka Gandhi v. Union of India',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1978,
    summary: 'Maneka Gandhi\'s passport was impounded by the government without giving her a hearing or reasons. The Supreme Court expanded the scope of Article 21 (Right to Life and Personal Liberty), ruling that the procedure established by law must be just, fair, and reasonable. The court held that Articles 14, 19, and 21 are not mutually exclusive but form a golden triangle of fundamental rights. Any law restricting personal liberty must satisfy the test of all three provisions.',
    outcome: 'Passport impounding order struck down. The court established that Article 21 requires procedure that is fair, just and reasonable, not merely any procedure established by law.',
    keyLaws: ['Article 21 of the Constitution', 'Article 14', 'Article 19', 'Passports Act 1967 Section 10(3)(c)'],
    fullText: 'Maneka Gandhi v. Union of India is a landmark judgment that significantly expanded the interpretation of Article 21 of the Indian Constitution. On July 2, 1977, Maneka Gandhi\'s passport was impounded by the Regional Passport Officer, New Delhi, under Section 10(3)(c) of the Passports Act, 1967, by order of the Government of India. The External Affairs Ministry declined to furnish reasons for the impounding in the interest of the general public. Maneka Gandhi challenged this order as violating her fundamental rights under Articles 14, 19(1)(a), and 21. The seven-judge bench overruled the narrow interpretation of Article 21 given in A.K. Gopalan v. State of Madras (1950). Justice P.N. Bhagwati, writing the majority opinion, held that the right to travel abroad is part of the right to personal liberty under Article 21. The procedure contemplated by Article 21 must be right, just, and fair and not arbitrary, fanciful, or oppressive. The court established that Articles 14, 19, and 21 are interconnected and any law or procedure affecting life or personal liberty must pass the test of all three articles.',
  },
  {
    caseReference: '(2017) 10 SCC 1',
    title: 'K.S. Puttaswamy v. Union of India (Right to Privacy)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 2017,
    summary: 'A nine-judge Constitution bench unanimously declared that the right to privacy is a fundamental right protected under Article 21 of the Constitution. The case arose from challenges to the Aadhaar biometric identification scheme. The court overruled M.P. Sharma (1954) and Kharak Singh (1962) to the extent they held that privacy is not a fundamental right. The judgment established that informational privacy, bodily autonomy, and decisional privacy are protected constitutional rights.',
    outcome: 'Right to privacy declared a fundamental right under Article 21. Previous contrary decisions overruled. Any invasion of privacy must meet the three-fold test of legality, legitimate aim, and proportionality.',
    keyLaws: ['Article 21 of the Constitution', 'Article 14', 'Article 19', 'Aadhaar Act 2016'],
    fullText: 'Justice K.S. Puttaswamy (Retd.) v. Union of India is a landmark case in which the Supreme Court of India declared the right to privacy as a fundamental right under the Indian Constitution. The case was referred to a nine-judge bench to settle the question of whether privacy is a constitutionally protected right, which arose in the context of challenges to the Aadhaar biometric identification system. The petitioners argued that the mandatory collection of biometric data violated their right to privacy. The Union of India argued that there was no fundamental right to privacy under the Indian Constitution, relying on M.P. Sharma v. Satish Chandra (1954) and Kharak Singh v. State of Uttar Pradesh (1962). The nine-judge bench unanimously held that the right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21. Justice D.Y. Chandrachud wrote that privacy includes preservation of personal intimacies, sanctity of family life, marriage, procreation, home, and sexual orientation. The court laid down that any invasion of privacy must satisfy the threefold requirement of legality (existence of a law), legitimate aim (proper governmental objective), and proportionality (the means must be proportional to the objective).',
  },
  {
    caseReference: 'AIR 1997 SC 3011',
    title: 'Vishaka v. State of Rajasthan (Sexual Harassment at Workplace)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1997,
    summary: 'Following the brutal gang rape of Bhanwari Devi, a social worker, the Supreme Court laid down guidelines to prevent sexual harassment of women at the workplace. In the absence of legislation, the court formulated the Vishaka Guidelines which defined sexual harassment, placed obligations on employers to prevent it, established complaint mechanisms, and mandated awareness programs. These guidelines had the force of law until the Sexual Harassment of Women at Workplace Act was enacted in 2013.',
    outcome: 'The court laid down the Vishaka Guidelines defining and prohibiting sexual harassment at workplace, binding on all employers until legislative action. Led to the Sexual Harassment of Women at Workplace Act, 2013.',
    keyLaws: ['Article 14 of the Constitution', 'Article 15', 'Article 19(1)(g)', 'Article 21', 'CEDAW Convention', 'Sexual Harassment of Women at Workplace Act 2013'],
    fullText: 'Vishaka and Others v. State of Rajasthan is a landmark judgment in which the Supreme Court of India, in the absence of domestic law, formulated guidelines to address sexual harassment at the workplace. The case was brought as a PIL (Public Interest Litigation) by several women\'s groups and NGOs following the alleged gang rape of Bhanwari Devi, a social worker from Rajasthan, who had attempted to prevent a child marriage. The state and police machinery failed to provide justice, leading to widespread outrage. Chief Justice J.S. Verma, writing for the three-judge bench, held that sexual harassment violates fundamental rights under Articles 14, 15, 19(1)(g), and 21. The court noted that in the absence of domestic law, the provisions of international conventions like CEDAW (Convention on the Elimination of All Forms of Discrimination Against Women) can be relied upon. The Vishaka Guidelines defined sexual harassment to include unwelcome sexually determined behavior such as physical contact, demand or request for sexual favors, sexually colored remarks, showing pornography, and any other unwelcome physical, verbal, or non-verbal conduct of a sexual nature. Employers were directed to establish complaints committees, initiate disciplinary action, and provide a safe working environment.',
  },
  {
    caseReference: 'AIR 1981 SC 746',
    title: 'S.P. Gupta v. Union of India (First Judges Case)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1981,
    summary: 'Known as the First Judges Transfer Case, this case addressed the independence of the judiciary and the process of appointment and transfer of judges. The court held that the Chief Justice of India\'s opinion on judicial appointments is not binding on the President (executive), though it carries great weight. This was later overruled by the Second Judges Case (1993) which established the collegium system.',
    outcome: 'The court held that the executive has primacy in judicial appointments. The Chief Justice\'s recommendation is not binding. This interpretation was later overruled in the Second and Third Judges Cases.',
    keyLaws: ['Article 124 of the Constitution', 'Article 217', 'Article 222', 'Article 226'],
    fullText: 'S.P. Gupta v. Union of India, popularly known as the First Judges Case or Judges Transfer Case, was a significant constitutional case dealing with the independence of the judiciary and the appointment and transfer of High Court judges. The case arose when the Union Law Minister issued circulars regarding the non-confirmation and transfer of judges. S.P. Gupta, a practicing advocate, challenged the executive\'s power over judicial appointments and transfers. The seven-judge bench held that the power to appoint judges under Articles 124 and 217 is vested in the President, who acts on the aid and advice of the Council of Ministers. While the opinion of the Chief Justice of India must be obtained, it is not binding. The court endorsed the primacy of the executive in judicial appointments, holding that "consultation" does not mean "concurrence." Justice P.N. Bhagwati introduced the concept of public interest litigation and expanded the rules of locus standi, allowing any person to approach the court on behalf of those who could not. This case was effectively overruled by the Supreme Court Advocates-on-Record Association v. Union of India (Second Judges Case, 1993) which held that the Chief Justice\'s opinion has primacy in matters of judicial appointments.',
  },
  {
    caseReference: 'Writ Petition (Criminal) No. 76 of 2016',
    title: 'Navtej Singh Johar v. Union of India (Section 377)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 2018,
    summary: 'A five-judge Constitution bench unanimously decriminalized consensual homosexual acts between adults by reading down Section 377 of the Indian Penal Code. The court held that Section 377, insofar as it criminalized consensual sexual conduct between adults in private, violated Articles 14, 15, 19, and 21 of the Constitution. The judgment recognized sexual orientation as integral to personal identity and dignity.',
    outcome: 'Section 377 IPC read down. Consensual sexual relations between adults in private decriminalized. The court overruled Suresh Kumar Koushal (2013) which had recriminalized homosexuality.',
    keyLaws: ['Section 377 of IPC', 'Article 14 of the Constitution', 'Article 15', 'Article 19', 'Article 21'],
    fullText: 'Navtej Singh Johar v. Union of India is a landmark judgment of the Supreme Court of India that effectively decriminalized homosexuality. The case was brought by five petitioners including dancer Navtej Singh Johar demanding that Section 377 of the Indian Penal Code, which criminalized "carnal intercourse against the order of nature," be declared unconstitutional insofar as it applied to consensual sexual acts between adults. The five-judge Constitution bench comprising Chief Justice Dipak Misra and Justices Rohinton Nariman, A.M. Khanwilkar, D.Y. Chandrachud, and Indu Malhotra unanimously held that Section 377, to the extent it criminalizes consensual sexual conduct between adults of the same sex, is unconstitutional. Justice Chandrachud wrote that the rights of LGBT persons are real rights founded on sound constitutional doctrine, and that sexual orientation is an essential attribute of privacy and dignity. Justice Malhotra noted that history owes an apology to the members of the LGBT community for the delay in providing redressal for the ignominy and ostracism they have suffered through. The court overruled its earlier decision in Suresh Kumar Koushal v. Naz Foundation (2013).',
  },
  {
    caseReference: 'AIR 2014 SC 563',
    title: 'National Legal Services Authority v. Union of India (NALSA - Transgender Rights)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 2014,
    summary: 'The Supreme Court recognized transgender persons as a "third gender" and affirmed their fundamental rights under the Constitution. The court directed the government to treat them as socially and educationally backward classes, extend reservation in education and jobs, operate separate HIV surveillance centers, and provide medical care including sex reassignment surgery. The judgment recognized the right to self-identification of gender.',
    outcome: 'Transgender persons recognized as third gender. Directed governments to grant them legal recognition, fundamental rights protections, and affirmative action benefits as socially backward classes.',
    keyLaws: ['Article 14 of the Constitution', 'Article 15', 'Article 16', 'Article 19', 'Article 21'],
    fullText: 'National Legal Services Authority v. Union of India is a landmark Supreme Court judgment recognizing the rights of transgender persons. The case was filed as a writ petition by NALSA seeking enforcement of the rights of transgender community members including hijras and eunuchs. Justice K.S. Radhakrishnan, writing for the bench, held that transgender persons have the right to decide their self-identified gender under Article 21. The court recognized that non-recognition of the identity of hijras/transgender persons denies them equal protection of law, and violates Articles 14, 15, 16, 19, and 21. The court directed the Centre and State Governments to grant legal recognition of gender identity whether male, female, or the third gender, recognize transgender persons\' right to self-identification of their gender, take steps to treat them as socially and educationally backward classes and extend all kinds of reservation in cases of admission in educational institutions and for public appointments, operate separate HIV surveillance centers, provide them medical care including free sex reassignment surgery, and take measures to address social stigma and discrimination.',
  },
  {
    caseReference: 'Criminal Appeal No. 395 of 2004',
    title: 'State of Gujarat v. Anirudhsing (Best Bakery Case)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 2004,
    summary: 'During the 2002 Gujarat riots, 14 people were killed when a mob set fire to the Best Bakery in Vadodara. All 21 accused were acquitted by the trial court after key witnesses, including the star witness Zaheera Sheikh, turned hostile. The Supreme Court ordered a retrial outside Gujarat, transferred the case to Mumbai, and criticized the state machinery for failing to protect witnesses and ensure fair trial.',
    outcome: 'Trial court acquittal set aside. Case transferred to Mumbai for retrial. 9 accused were convicted by the Mumbai court. Zaheera Sheikh was later convicted of perjury.',
    keyLaws: ['Section 302 of IPC', 'Section 307 IPC', 'Section 436 IPC', 'Section 149 IPC', 'Article 21 of the Constitution'],
    fullText: 'The Best Bakery case is one of the most prominent cases arising from the 2002 Gujarat communal riots. On March 1, 2002, during widespread communal violence in Gujarat, a mob attacked the Best Bakery in Vadodara, setting it on fire. Fourteen people, including Muslims who had taken shelter in the bakery, were killed. The FIR was filed and 21 persons were charged under Sections 302, 307, 436, and 149 of the Indian Penal Code. In the trial before the Vadodara Fast Track Court, key witnesses including Zaheera Sheikh, who had identified the attackers, turned hostile. All 21 accused were acquitted on June 27, 2003. The NHRC and several citizens challenged the acquittal. The Supreme Court in April 2004, in a judgment delivered by Justice Doraiswamy Raju and Justice Arijit Pasayat, set aside the acquittal and ordered a de novo retrial. The court directed the transfer of the case from Gujarat to Mumbai, noting that a fair trial was not possible in Gujarat given the climate of fear and intimidation of witnesses. The court observed that the justice delivery system was seriously compromised and that the state has a definite role in protecting witnesses.',
  },
  {
    caseReference: 'Criminal Appeal No. 607 of 2017',
    title: 'Mukesh v. State (NCT of Delhi) (Nirbhaya Case)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 2017,
    summary: 'The case arose from the brutal gang rape and murder of a 23-year-old physiotherapy student on a moving bus in Delhi on December 16, 2012. The Supreme Court upheld the death penalty for four of the six accused, affirming that the crime fell within the "rarest of rare" category. The case led to significant legal reforms including the Criminal Law (Amendment) Act, 2013, which strengthened laws against sexual offenses.',
    outcome: 'Death sentences of all four adult convicts (Mukesh, Pawan Gupta, Vinay Sharma, and Akshay Kumar Singh) upheld. All four were executed on March 20, 2020.',
    keyLaws: ['Section 302 of IPC', 'Section 376(2)(g) IPC', 'Section 377 IPC', 'Section 396 IPC', 'Section 307 IPC', 'Criminal Law Amendment Act 2013'],
    fullText: 'Mukesh and Another v. State for NCT of Delhi and Others, commonly known as the Nirbhaya case or Delhi gang rape case, involved the gang rape and fatal assault of a 23-year-old woman on a moving bus in Delhi on December 16, 2012. The victim and her male companion boarded a private charter bus where they were attacked by six assailants. The woman was repeatedly raped and tortured with an iron rod, causing severe internal injuries. She died on December 29, 2012, in a Singapore hospital. The incident sparked nationwide protests and led to the formation of the Justice Verma Committee which recommended reforms in criminal law. The Criminal Law (Amendment) Act 2013 was enacted, expanding the definition of rape, increasing penalties, and introducing new offenses like stalking and voyeurism. The trial court convicted five adult accused and sentenced four to death and awarded life imprisonment to the other. One accused, Ram Singh, was found dead in his cell. The juvenile offender was convicted by the Juvenile Justice Board. The Delhi High Court confirmed the death sentences. The Supreme Court, in the appeal, upheld the death sentences of Mukesh Kumar, Pawan Gupta, Vinay Sharma, and Akshay Kumar Singh, holding that the case fell in the rarest of rare category warranting capital punishment. The court observed that the barbaric and inhuman nature of the crime shocked the collective conscience of society.',
  },
  {
    caseReference: 'AIR 1985 SC 652',
    title: 'Olga Tellis v. Bombay Municipal Corporation (Pavement Dwellers Case)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1985,
    summary: 'Pavement and slum dwellers in Bombay challenged the municipal corporation\'s decision to demolish their homes and evict them. The Supreme Court held that the right to livelihood is an essential facet of the right to life under Article 21. While the court recognized the state\'s right to remove encroachments, it held that eviction could not be carried out without following due process and providing reasonable notice to affected persons.',
    outcome: 'The court recognized right to livelihood as part of Article 21 but permitted eviction with conditions - reasonable notice, alternative sites, and no eviction during monsoon season.',
    keyLaws: ['Article 21 of the Constitution', 'Article 14', 'Article 19', 'Bombay Municipal Corporation Act Section 314'],
    fullText: 'Olga Tellis v. Bombay Municipal Corporation is a landmark case on the right to livelihood as part of the right to life. The petitioners were pavement dwellers and slum dwellers who had migrated to Bombay in search of livelihood and were living on pavements and in slums. The Bombay Municipal Corporation decided to demolish pavement dwellings and evict thousands of people as encroachers on public property. The petitioners argued that they had a fundamental right to reside on pavements and that the proposed eviction violated Article 21. Chief Justice Y.V. Chandrachud, delivering the judgment, held that the right to livelihood is born out of the right to life, as no person can live without the means of living. The court held that the sweep of the right to life under Article 21 is wide and far reaching. It does not mean merely that life cannot be extinguished except according to procedure established by law. An equally important facet of that right is the right to livelihood because no person can live without the means of living. However, the court held that pavement dwellers did not have an absolute right to encroach and the state could remove encroachments following due process.',
  },
  {
    caseReference: 'AIR 1993 SC 477',
    title: 'Supreme Court Advocates-on-Record Association v. Union of India (Second Judges Case)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1993,
    summary: 'This case established the collegium system for appointment of Supreme Court and High Court judges. The nine-judge bench held that the Chief Justice of India\'s opinion, formed in consultation with two senior-most judges, has primacy in matters of judicial appointments. The executive cannot override the CJI\'s recommendation. This effectively reversed the First Judges Case (1981) and established judicial supremacy in appointments.',
    outcome: 'CJI\'s recommendation given primacy in judicial appointments. The collegium system (CJI plus two senior judges) established for recommending appointments to the Supreme Court.',
    keyLaws: ['Article 124(2) of the Constitution', 'Article 217(1)', 'Article 222'],
    fullText: 'Supreme Court Advocates-on-Record Association v. Union of India, known as the Second Judges Case, is a landmark ruling that fundamentally changed the process of appointing judges to the higher judiciary in India. The case reconsidered the interpretation of the word "consultation" in Articles 124(2) and 217(1) of the Constitution. A nine-judge bench overruled the First Judges Case (S.P. Gupta, 1981) and held that the Chief Justice of India has primacy in the matter of appointments to the Supreme Court and High Courts. Justice J.S. Verma, writing the majority opinion, held that consultation means concurrence and the CJI\'s opinion formed after consulting the two senior-most judges has primacy. The executive cannot appoint a judge if the CJI does not recommend. This case established the collegium system where the CJI and a collegium of senior judges make recommendations for judicial appointments, effectively giving the judiciary control over its own composition.',
  },
  {
    caseReference: 'AIR 2006 SC 1806',
    title: 'Unni Krishnan v. State of Andhra Pradesh (Right to Education)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1993,
    summary: 'The Supreme Court held that the right to education for children up to the age of 14 is a fundamental right flowing from Article 21 (Right to Life). The court recognized that without education, a person cannot exercise their other fundamental rights effectively. This judgment laid the foundation for the 86th Constitutional Amendment (2002) which inserted Article 21A making right to education an explicit fundamental right.',
    outcome: 'Right to free education up to age 14 recognized as fundamental right under Article 21. Led to the 86th Amendment inserting Article 21A and the Right of Children to Free and Compulsory Education Act, 2009.',
    keyLaws: ['Article 21 of the Constitution', 'Article 21A', 'Article 41', 'Article 45', 'Article 46', 'Right to Education Act 2009'],
    fullText: 'Unni Krishnan v. State of Andhra Pradesh addressed the scope of the right to education under the Indian Constitution. The case originated from challenges to capitation fees charged by private educational institutions in Andhra Pradesh. Justice Jeevan Reddy, writing for the majority, held that the right to education flows directly from the right to life under Article 21. The court held that every citizen of this country has a right to free education until the age of 14 years. After 14, the right to education is subject to the limits of economic capacity and development of the state. The court partially overruled Mohini Jain v. State of Karnataka to the extent it held a broad right to education at all levels as a fundamental right. The judgment was instrumental in the insertion of Article 21A by the 86th Constitutional Amendment in 2002 and the subsequent enactment of the Right of Children to Free and Compulsory Education Act in 2009.',
  },
  {
    caseReference: 'AIR 2018 SC 4321',
    title: 'Indian Young Lawyers Association v. State of Kerala (Sabarimala Case)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 2018,
    summary: 'A five-judge Constitution bench, by a 4:1 majority, lifted the ban on entry of women of menstruating age (10-50 years) into the Sabarimala temple in Kerala. The court held that the ban violated women\'s fundamental rights to equality, non-discrimination, and freedom of religion. Justice Indu Malhotra was the lone dissenter, holding that courts should not interfere in matters of religious practice.',
    outcome: 'Ban on women aged 10-50 entering Sabarimala temple struck down as violative of Articles 14, 15, 25, and 51A(e). Review petitions later referred to a larger bench.',
    keyLaws: ['Article 14 of the Constitution', 'Article 15', 'Article 25', 'Article 26', 'Kerala Hindu Places of Public Worship (Authorisation of Entry) Rules 1965 Rule 3(b)'],
    fullText: 'Indian Young Lawyers Association v. State of Kerala is a landmark case concerning the entry of women into the Sabarimala temple. The Sabarimala Ayyappa temple in Kerala prohibited women between the ages of 10 and 50 from entering the shrine based on the belief that the deity Lord Ayyappa is a Naishtika Brahmachari (eternal celibate). Rule 3(b) of the Kerala Hindu Places of Public Worship Rules 1965 supported this ban. The petitioners challenged this as discriminatory. The five-judge Constitution bench comprising CJI Dipak Misra, Justices Rohinton Nariman, A.M. Khanwilkar, D.Y. Chandrachud, and Indu Malhotra, by a 4:1 majority, struck down the ban. The majority held that the exclusion of women based on biological and physiological features is a form of untouchability violating Article 17. Justice Chandrachud held that patriarchal notions cannot be granted the status of a religious practice. Justice Malhotra dissented, holding that courts should not interfere with essential religious practices and that what constitutes an essential practice should be determined by the religious denomination itself.',
  },
  {
    caseReference: 'Criminal Appeal No. 186 of 2004',
    title: 'Bachan Singh v. State of Punjab (Death Penalty - Rarest of Rare)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 1980,
    summary: 'The Supreme Court upheld the constitutional validity of the death penalty under Section 302 IPC, ruling that it does not violate Article 21. However, the court established the "rarest of rare" doctrine, holding that death sentences should only be imposed in the rarest of rare cases where the alternative of life imprisonment is foreclosed. The court laid down aggravating and mitigating circumstances to guide judicial discretion.',
    outcome: 'Death penalty held constitutional but restricted to the rarest of rare cases. Life imprisonment is the rule, death sentence is the exception. Courts must give special reasons for imposing death.',
    keyLaws: ['Section 302 of IPC', 'Section 354(3) CrPC', 'Article 14 of the Constitution', 'Article 19', 'Article 21'],
    fullText: 'Bachan Singh v. State of Punjab is the landmark judgment that established the rarest of rare doctrine for the imposition of the death penalty in India. The case challenged the constitutional validity of Section 302 of the Indian Penal Code which prescribes death as one of the punishments for murder. A five-judge bench by a 4:1 majority upheld the constitutionality of the death penalty. Justice M.H. Beg, Justice Y.V. Chandrachud, Justice A.C. Gupta, and Justice N.L. Untwalia formed the majority, while Justice P.N. Bhagwati dissented. The majority held that the death penalty as an alternative punishment for murder does not violate Articles 14, 19, and 21 of the Constitution. However, the court held that death sentence should be imposed only in the rarest of rare cases and when the alternative option is unquestionably foreclosed. The court enumerated aggravating circumstances such as the murder being committed with extreme brutality, the victim being a child or helpless person, and the murder being committed for pecuniary gain. Mitigating circumstances include the possibility of reformation, young age, emotional disturbance, and minor role in the crime.',
  },
  {
    caseReference: 'AIR 1994 SC 1918',
    title: 'S.R. Bommai v. Union of India (President\'s Rule)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 1994,
    summary: 'The Supreme Court addressed the misuse of Article 356 (President\'s Rule) to dismiss state governments. The nine-judge bench held that the President\'s satisfaction under Article 356 is subject to judicial review. The court laid down that floor tests are the only way to determine government majority, not the Governor\'s subjective assessment. Secularism was declared a basic feature of the Constitution.',
    outcome: 'Presidential proclamation under Article 356 held subject to judicial review. Secularism declared basic feature. Floor test held mandatory to determine legislative confidence. Dismissed state governments in Karnataka, Nagaland, and Meghalaya must be restored.',
    keyLaws: ['Article 356 of the Constitution', 'Article 74', 'Article 164', 'Article 174'],
    fullText: 'S.R. Bommai v. Union of India is a landmark case on the use and abuse of Article 356 of the Constitution which deals with the imposition of President\'s Rule in states. The case arose from multiple instances where the Central Government dismissed state governments using Article 356. S.R. Bommai, the former Chief Minister of Karnataka, challenged his dismissal along with chief ministers from other states. The nine-judge bench delivered nine separate opinions but established several key principles. The court held that the presidential proclamation under Article 356 is subject to judicial review on grounds of mala fide or extraneous considerations. The court held that floor tests are the proper method to determine whether a government commands legislative majority, and the Governor cannot determine this based on personal assessment. The judgment declared secularism as a basic feature of the Constitution and held that a state government pursuing anti-secular policies may be dismissed under Article 356. The court also held that the state legislative assembly should not be dissolved before Parliament approves the proclamation, to allow restoration if the proclamation is found unconstitutional.',
  },
  {
    caseReference: 'Criminal Appeal No. 1525-1526 of 2019',
    title: 'Arnesh Kumar v. State of Bihar (Arrest Guidelines)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 2014,
    summary: 'The Supreme Court laid down strict guidelines to prevent unnecessary arrests in cases punishable with imprisonment up to seven years, particularly under Section 498A IPC (cruelty by husband). The court directed police to not automatically arrest the accused but to first determine whether arrest is necessary based on specific parameters, and to obtain Magistrate\'s approval before arrest.',
    outcome: 'Police directed not to automatically arrest in cases with sentence up to 7 years. Checklist for necessity of arrest mandated. Non-compliance may result in departmental action against police and contempt proceedings against Magistrate.',
    keyLaws: ['Section 498A of IPC', 'Section 41 CrPC', 'Section 41A CrPC', 'Article 21 of the Constitution', 'Article 22'],
    fullText: 'Arnesh Kumar v. State of Bihar is a key judgment addressing the misuse of the power of arrest, particularly in matrimonial cases under Section 498A IPC. The court noted that Section 498A (cruelty by husband or relatives) had become a powerful weapon in the hands of disgruntled wives, often used to harass the husband and his family. Justice C.K. Prasad laid down that in cases where the offense is punishable with imprisonment for a term which may be less than seven years, or which may extend to seven years with or without fine, the police officer shall not arrest without a warrant. Before making an arrest, the police officer must be satisfied that the arrest is necessary to prevent the person from committing further offense, for proper investigation, to prevent evidence tampering, or to prevent the person from making inducement to witnesses. The court directed that in every case where arrest is not made, the police officer must record reasons in the case diary. The Magistrate authorizing detention must also record satisfaction that the arrest is warranted.',
  },
  {
    caseReference: 'SC Writ Petition (Civil) No. 494 of 2012',
    title: 'Shreya Singhal v. Union of India (Section 66A IT Act)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 2015,
    summary: 'The Supreme Court struck down Section 66A of the Information Technology Act 2000 as unconstitutional, holding it violated the right to free speech under Article 19(1)(a). Section 66A penalized sending "offensive" or "menacing" messages through electronic communication. The court held the terms were vague, undefined, and capable of being used to suppress legitimate speech and political dissent.',
    outcome: 'Section 66A of IT Act 2000 struck down as unconstitutional for violating Article 19(1)(a). Section 69A (blocking websites) and Section 79 (intermediary liability) upheld with safeguards.',
    keyLaws: ['Section 66A of IT Act 2000', 'Section 69A IT Act', 'Section 79 IT Act', 'Article 19(1)(a) of the Constitution', 'Article 19(2)'],
    fullText: 'Shreya Singhal v. Union of India is a landmark judgment on free speech in the digital age. The case was filed by Shreya Singhal, a law student, challenging Section 66A of the Information Technology Act 2000 after two women were arrested in Mumbai for posting a comment on Facebook criticizing the shutdown of Mumbai following the death of politician Bal Thackeray. Section 66A prescribed punishment for sending information through electronic communication that was "grossly offensive" or had "menacing character" or caused "annoyance or inconvenience." Justice Rohinton Nariman, writing for the bench, struck down Section 66A as unconstitutional. The court held that the section was vague and over-broad, using undefined terms like "grossly offensive," "menacing," and "causing annoyance" that could net innocent speech. The court distinguished between discussion, advocacy, and incitement, holding that only incitement to imminent lawless action can be restricted. The court upheld Section 69A (power to block websites) noting it has procedural safeguards including reasons in writing, hearing to the originator, and review by a committee. Section 79 (intermediary liability safe harbor) was also upheld with the reading that intermediaries must be specifically notified by court order before being required to take down content.',
  },
  {
    caseReference: 'Criminal Appeal No. 1277 of 2008',
    title: 'Aruna Ramchandra Shanbaug v. Union of India (Passive Euthanasia)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 2011,
    summary: 'The case of Aruna Shanbaug, a nurse who was in a persistent vegetative state for 37 years after a sexual assault, led the Supreme Court to address the issue of euthanasia. The court distinguished between active euthanasia (which remains illegal) and passive euthanasia (withdrawal of life support), and permitted passive euthanasia under strict guidelines including approval by a High Court bench.',
    outcome: 'Active euthanasia held illegal. Passive euthanasia (withdrawal of life support) permitted under strict guidelines with High Court approval. Paved the way for the right to die with dignity in the Common Cause judgment (2018).',
    keyLaws: ['Section 309 of IPC', 'Section 306 IPC', 'Article 21 of the Constitution'],
    fullText: 'Aruna Ramchandra Shanbaug v. Union of India is a landmark case that addressed the legality of euthanasia in India. On November 27, 1973, Aruna Shanbaug, a nurse at King Edward Memorial Hospital, Mumbai, was sexually assaulted by a ward boy who strangled her with a chain during the assault. The attack left her in a persistent vegetative state with severe brain damage. She lived in this condition for nearly 42 years. In 2011, journalist Pinki Virani filed a petition as Aruna\'s "next friend" seeking permission for passive euthanasia by stopping the feeding of Aruna. The Supreme Court bench of Justices Markandey Katju and Gyan Sudha Misra denied the specific request to withdraw life support for Aruna, noting that the KEM Hospital staff who had been caring for her for decades were her real family. However, the court laid down important guidelines for passive euthanasia. The court held that while active euthanasia (administering lethal substances) is illegal and amounts to culpable homicide under Section 300 IPC, passive euthanasia (withdrawing life-sustaining treatment) can be permitted in extraordinary circumstances. The decision to discontinue life support must be taken by parents, spouse, or other close relatives, or in their absence by a "next friend," and requires the approval of the concerned High Court.',
  },
  {
    caseReference: 'AIR 2005 SC 3100',
    title: 'P.A. Inamdar v. State of Maharashtra (Minority Institutions)',
    caseType: 'civil',
    court: 'Supreme Court of India',
    year: 2005,
    summary: 'A seven-judge bench addressed the rights of private unaided educational institutions, both minority and non-minority. The court held that the state cannot impose its reservation policy on private unaided institutions, as this would violate the right to establish and administer educational institutions under Article 19(1)(g) and Article 30. However, institutions must maintain transparency in their admission process.',
    outcome: 'State cannot impose reservation quotas on private unaided institutions (both minority and non-minority). Institutions must follow fair and transparent admission process. Overruled Islamic Academy of Education to the extent it permitted state interference.',
    keyLaws: ['Article 19(1)(g) of the Constitution', 'Article 26', 'Article 29', 'Article 30'],
    fullText: 'P.A. Inamdar v. State of Maharashtra dealt with the extent to which the state can regulate admissions in private unaided professional educational institutions. The seven-judge bench addressed issues arising from T.M.A. Pai Foundation v. State of Karnataka (2002) and Islamic Academy of Education v. State of Karnataka (2003). The key question was whether the state could impose its reservation policy on private unaided educational institutions. Chief Justice R.C. Lahoti, writing for the majority, held that private unaided educational institutions, whether minority or non-minority, cannot have quotas or reservations imposed on them by the state. The right to establish and administer educational institutions guaranteed under Articles 19(1)(g) and 30 includes the right to select students through a fair and transparent admission process devised by the institution. The court held that compelling a private unaided institution to give up a share of its available seats to state nominees was an unreasonable restriction. However, the court noted that this decision would not affect the validity of any law made by the appropriate legislature in exercise of its powers under Article 15(5), which was subsequently inserted by the 93rd Constitutional Amendment.',
  },
  {
    caseReference: 'Criminal Appeal No. 420 of 1992',
    title: 'State of Rajasthan v. Balchand (Bail Jurisprudence)',
    caseType: 'criminal',
    court: 'Supreme Court of India',
    year: 1977,
    summary: 'Justice V.R. Krishna Iyer laid down the foundational principle of Indian bail jurisprudence: "The basic rule is bail, not jail." The court held that when considering bail applications, the gravity of the offense alone is not sufficient reason for denying bail. The court must consider whether the accused is likely to flee, tamper with evidence, or intimidate witnesses. Personal liberty under Article 21 requires that bail should be the norm, not the exception.',
    outcome: 'Established "bail is the rule, jail is the exception" as fundamental principle. Courts must consider flight risk, evidence tampering risk, and witness intimidation rather than merely the gravity of the offense when deciding bail.',
    keyLaws: ['Section 437 CrPC', 'Section 439 CrPC', 'Article 21 of the Constitution', 'Article 22'],
    fullText: 'State of Rajasthan v. Balchand @ Baliay is a foundational case in Indian bail jurisprudence. Justice V.R. Krishna Iyer, in this brief but influential judgment, articulated the principle that personal liberty is sacrosanct and that bail is the rule, not jail. The accused Balchand was convicted by the Sessions Court and sentenced to life imprisonment for murder under Section 302 IPC. He was granted bail pending appeal by the High Court. The State challenged this order before the Supreme Court. Justice Krishna Iyer held that the basic rule may perhaps be tersely put as bail, not jail, except where there are circumstances suggestive of fleeing from justice or thwarting the course of justice or creating other troubles in the shape of repeating offenses or intimidating witnesses and the like. The court emphasized that detention before conviction has a substantial punitive content and it would be unjust to deprive a person of liberty merely on the basis of an allegation. The gravity of the offense is relevant but not the sole criterion. This principle has been consistently followed and reiterated in subsequent decisions including Sanjay Chandra v. CBI (2012) and Arnab Goswami v. State of Maharashtra (2020).',
  },
];

async function seed() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log(`Seeding ${cases.length} landmark Indian cases...`);

    let embeddingCount = 0;
    for (let i = 0; i < cases.length; i++) {
      const c = cases[i];
      console.log(`[${i + 1}/${cases.length}] Processing: ${c.title}`);

      const textForEmbedding = `${c.title}. ${c.summary}. ${c.fullText}`;
      const embedding = await generateEmbedding(textForEmbedding);

      const updateData = { ...c };
      if (embedding) {
        updateData.embedding = embedding;
        embeddingCount++;
      }

      await SimilarCase.findOneAndUpdate(
        { caseReference: c.caseReference },
        updateData,
        { upsert: true, new: true }
      );

      if (embedding) {
        console.log(`  -> Saved with ${embedding.length}-dim embedding`);
        // Small delay to respect rate limits
        if (i < cases.length - 1) await new Promise((r) => setTimeout(r, 1500));
      } else {
        console.log(`  -> Saved (text only, keyword search enabled)`);
      }
    }

    console.log(`\nEmbeddings: ${embeddingCount}/${cases.length} cases have vector embeddings.`);
    if (embeddingCount < cases.length) {
      console.log('Remaining cases will use keyword-based similarity search.');
    }

    console.log(`\nDone! Seeded ${cases.length} cases into SimilarCase collection.`);
    const count = await SimilarCase.countDocuments();
    console.log(`Total documents in collection: ${count}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
