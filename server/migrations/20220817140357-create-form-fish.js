'use strict'

const { DataTypes } = require('sequelize')
const Sequelize = require('sequelize')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')

const tableName = 'FormFishes'

const nomenclatures = {
  fishes_age: [
    {
      label: {
        bg: 'Ad (Възрастен)',
        en: 'Ad (Adult)'
      }
    },
    {
      label: {
        bg: 'Juv (млад, неполовозрял)',
        en: 'Juv (Juvenile, not adult)'
      }
    },
    {
      label: {
        bg: '0+ (Личинки)',
        en: '0+ (Larvae)'
      }
    },
    {
      label: {
        bg: 'Eggs (яйца)',
        en: 'Eggs'
      }
    }
  ],
  fishes_sex: [
    {
      label: {
        bg: 'M (мъжки)',
        en: 'M (male)'
      }
    },
    {
      label: {
        bg: 'F (женски)',
        en: 'F (female)'
      }
    }
  ],
  fishes_findings: [
    {
      label: {
        bg: 'уловен',
        en: 'caught specimen'
      }
    },
    {
      label: {
        bg: 'мониторинг',
        en: 'monitoring'
      }
    },
    {
      label: {
        bg: 'мъртъв екземпляр',
        en: 'dead specimen'
      }
    },
    {
      label: {
        bg: 'наблюдаван',
        en: 'observed'
      }
    }
  ],
  fishes_monitoring_type: [
    {
      label: {
        bg: 'електроулов',
        en: 'electrofishing'
      }
    },
    {
      label: {
        bg: 'винтери',
        en: 'fish traps'
      }
    },
    {
      label: {
        bg: 'гриб',
        en: 'sceine net'
      }
    },
    {
      label: {
        bg: 'стоящи мрежи',
        en: 'gill net'
      }
    },
    {
      label: {
        bg: 'плаващи мрежи',
        en: 'floating net'
      }
    },
    {
      label: {
        bg: 'планктонни мрежи',
        en: 'plankton net'
      }
    }
  ],
  fishes_habitat_description_type: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R16', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16'].map(val => ({
    label: {
      bg: val,
      en: val
    }
  })),
  fishes_water_level: [
    {
      label: {
        bg: 'ниско',
        en: 'low'
      }
    },
    {
      label: {
        bg: 'нормално',
        en: 'normal'
      }
    },
    {
      label: {
        bg: 'високо',
        en: 'high'
      }
    }
  ],
  fishes_river_current: [
    {
      label: {
        bg: 'бързо',
        en: 'fast'
      }
    },
    {
      label: {
        bg: 'средно',
        en: 'moderate'
      }
    },
    {
      label: {
        bg: 'бавно',
        en: 'slow'
      }
    }
  ],
  fishes_bank_type: [
    {
      label: {
        bg: 'изкуствен/дигиран',
        en: 'artificial/dike'
      }
    },
    {
      label: {
        bg: 'естествен',
        en: 'natural'
      }
    },
    {
      label: {
        bg: 'полуестествен',
        en: 'semi natural'
      }
    }
  ],
  fishes_shelters: [
    {
      label: {
        bg: 'камъни',
        en: 'stones'
      }
    },
    {
      label: {
        bg: 'дървета',
        en: 'trees'
      }
    },
    {
      label: {
        bg: 'корени',
        en: 'roots'
      }
    },
    {
      label: {
        bg: 'подмоли',
        en: 'cavities'
      }
    },
    {
      label: {
        bg: 'други',
        en: 'other'
      }
    },
    {
      label: {
        bg: 'липсват',
        en: 'none'
      }
    }
  ],
  fishes_vegetation_type: [
    {
      label: {
        bg: 'потопена',
        en: 'submerged'
      }
    },
    {
      label: {
        bg: 'плуваща',
        en: 'floating'
      }
    },
    {
      label: {
        bg: 'подводна',
        en: 'underwater'
      }
    }
  ]
}

const species = {
  fishes: [
    { label: { la: 'Eudontomyzon mariae', bg: 'Украинска минога', en: 'Ukrainian brook lamprey' } },
    { label: { la: 'Eudontomyzon sp.', bg: 'минога', en: 'Brook lamprey' } },
    { label: { la: 'Squalus acanthias', bg: 'Черноморска акула', en: 'Spurdog' } },
    { label: { la: 'Squalus blainvillei', bg: 'Малка бодлива акула', en: 'Longnose spurdog' } },
    { label: { la: 'Squalus sp.', bg: 'акула', en: 'Spurdog shark' } },
    { label: { la: 'Raja clavata', bg: 'Морска лисица', en: 'Thornback ray' } },
    { label: { la: 'Dasyatis pastinaca', bg: 'Морска котка', en: 'Common stingray' } },
    { label: { la: 'Acipenser gueldenstaedtii', bg: 'Руска есетра', en: 'Russian sturgeon' } },
    { label: { la: 'Acipenser nudiventris', bg: 'Шип', en: 'Ship sturgeon' } },
    { label: { la: 'Acipenser ruthenus', bg: 'Чига', en: 'Sterlet' } },
    { label: { la: 'Acipenser stellatus', bg: 'Пъструга', en: 'Stellate sturgeon' } },
    { label: { la: 'Acipenser sturio', bg: 'Немска есетра', en: 'Atlantic sturgeon' } },
    { label: { la: 'Acipenser sp.', bg: 'есетра', en: 'Sturgeon' } },
    { label: { la: 'Huso huso', bg: 'Моруна', en: 'Beluga' } },
    { label: { la: 'Anguilla anguilla', bg: 'Змиорка', en: 'European eel' } },
    { label: { la: 'Sprattus sprattus', bg: 'Цаца', en: 'European sprat' } },
    { label: { la: 'Clupeonella cultriventris', bg: 'Езерна цаца', en: 'Black Sea tyulka' } },
    { label: { la: 'Sardina pilchardus', bg: 'Сардина', en: 'European pilchard' } },
    { label: { la: 'Sardinella aurita', bg: 'Сардела', en: 'Round sardinella' } },
    { label: { la: 'Alosa fallax', bg: 'Средиземноморска финта', en: 'Twaite shad' } },
    { label: { la: 'Alosa immaculata', bg: 'Карагьоз', en: 'Black Sea shad' } },
    { label: { la: 'Alosa maeotica', bg: 'Блеч', en: 'Azov shad' } },
    { label: { la: 'Alosa tanaica', bg: 'Харип', en: 'Black Sea shad' } },
    { label: { la: 'Alosa sp.', bg: '', en: 'Shad' } },
    { label: { la: 'Engraulis encrasicolus', bg: 'Хамсия', en: 'Blue anchovy' } },
    { label: { la: 'Rhodeus amarus', bg: 'Горчивка', en: 'Bitterling' } },
    { label: { la: 'Gobio bulgaricus', bg: 'Южна кротушка', en: 'Aegean gudgeon' } },
    { label: { la: 'Gobio gobio', bg: 'Обикновена кротушка', en: 'Common gudgeon' } },
    { label: { la: 'Gobio kovatschevi', bg: 'Приморска кротушка', en: 'Varna gudgeon' } },
    { label: { la: 'Gobio obtusirostris', bg: 'Дунавска кротушка', en: 'Danube gudgeon' } },
    { label: { la: 'Gobio sp.', bg: 'кротушка', en: 'Gudgeon' } },
    { label: { la: 'Romanogobio kesslerii', bg: 'Балканска кротушка', en: 'Sand gudgeon' } },
    { label: { la: 'Romanogobio uranoscopus', bg: 'Малка кротушка', en: 'Stone gudgeon' } },
    { label: { la: 'Romanogobio vladykovi', bg: 'Белопера кротушка', en: 'Danube whitefin gudgeon' } },
    { label: { la: 'Romanogobio antipai', bg: 'Кротушка на Антипа', en: 'Danube delta gudgeon' } },
    { label: { la: 'Romanogobio sp.', bg: '', en: 'Gudgeon' } },
    { label: { la: 'Barbus balcanicus', bg: 'Балканска мряна', en: 'Large spot barbel' } },
    { label: { la: 'Barbus barbus', bg: 'Бяла мряна', en: 'Common barbel' } },
    { label: { la: 'Barbus bergi', bg: 'Приморска мряна', en: 'Bulgarian barbel' } },
    { label: { la: 'Barbus cyclolepis', bg: 'Маришка мряна', en: 'Maritza barbel' } },
    { label: { la: 'Barbus petenyi', bg: 'Черна мряна', en: 'Romanian barbel' } },
    { label: { la: 'Barbus strumicae', bg: 'Струмска мряна', en: 'Strumica barbel' } },
    { label: { la: 'Barbus sp.', bg: 'мряна', en: 'Barbel' } },
    { label: { la: 'Carassius carassius', bg: 'Златиста каракуда', en: 'Crucian carp' } },
    { label: { la: 'Carassius gibelio', bg: 'Сребриста каракуда', en: 'Prussian carp' } },
    { label: { la: 'Carassius sp.', bg: 'каракуда', en: 'Carassius' } },
    { label: { la: 'Cyprinus carpio', bg: 'Шаран', en: 'Carp' } },
    { label: { la: 'Abramis brama', bg: 'Платика', en: 'Common bream' } },
    { label: { la: 'Abramis sp.', bg: '', en: 'Bream' } },
    { label: { la: 'Alburnoides bipunctatus', bg: 'Дунавска говедарка ', en: 'Danube spirlin' } },
    { label: { la: 'Alburnoides strymonicus', bg: 'Струмска говедарка', en: 'Struma spirlin' } },
    { label: { la: 'Alburnoides tzanevi', bg: 'Странджанска говедарка', en: 'Strandzha spirlin' } },
    { label: { la: 'Alburnoides sp.', bg: 'говедарка', en: 'Spirlin' } },
    { label: { la: 'Alburus alburnus', bg: 'Уклей', en: 'Common bleak' } },
    { label: { la: 'Alburnus danubicus', bg: 'Дунавска брияна', en: 'Danube shemaya' } },
    { label: { la: 'Alburnus mandrensis', bg: 'Мандренска брияна', en: 'Mandra shemaya' } },
    { label: { la: 'Alburnus sarmaticus', bg: 'Облез', en: 'Pontian shemaya' } },
    { label: { la: 'Alburnus schischkovi', bg: 'Резовска брияна', en: 'Rezovska shemaya' } },
    { label: { la: 'Alburnus sp.', bg: '', en: 'Bleak' } },
    { label: { la: 'Aspius aspius', bg: 'Распер', en: 'Asp' } },
    { label: { la: 'Ballerus ballerus', bg: 'Чил косат', en: 'Blue bream' } },
    { label: { la: 'Ballerus sapa', bg: 'Немски косат', en: 'White-eye bream' } },
    { label: { la: 'Ballerus sp.', bg: 'косат', en: 'Ballerus' } },
    { label: { la: 'Blicca bjoerkna', bg: 'Бабка', en: 'Silver bream' } },
    { label: { la: 'Chondrostoma nasus', bg: 'Дунавски скобар', en: 'Common nase' } },
    { label: { la: 'Chondrostoma vardarense', bg: 'Вардарски скобар', en: 'Vardar nase' } },
    { label: { la: 'Chondrostoma sp.', bg: 'скобар', en: 'Nase' } },
    { label: { la: 'Hypophthalmichthys molitrix', bg: 'Бял толстолоб', en: 'Silver carp' } },
    { label: { la: 'Hypophthalmichthys nobilis', bg: 'Пъстър толстолоб', en: 'Bighead carp' } },
    { label: { la: 'Hypophthalmichthys sp.', bg: 'толстолоб', en: 'Hypophthalmichthys' } },
    { label: { la: 'Leucaspius delineatus', bg: 'Върловка', en: 'Sun bleak' } },
    { label: { la: 'Leuciscus idus', bg: 'Мъздруга', en: 'Ide' } },
    { label: { la: 'Pelecus cultratus', bg: 'Сабица', en: 'Ziege' } },
    { label: { la: 'Petroleuciscus borysthenicus', bg: 'Малък речен кефал', en: 'Dnieper chub' } },
    { label: { la: 'Phoxinus phoxinus', bg: 'Обикновена лешанка', en: 'Common minnow' } },
    { label: { la: 'Phoxinus strandjae', bg: 'Странджанска лешанка', en: 'Strandzha minnow' } },
    { label: { la: 'Phoxinus strymonicus', bg: 'Струмска лешанка', en: 'Aegean minnow' } },
    { label: { la: 'Phoxinus sp.', bg: 'лешанка', en: 'Minnow' } },
    { label: { la: 'Rutilus frisii', bg: 'Лупавец', en: 'Kutum' } },
    { label: { la: 'Rutilus rutilus', bg: 'Бабушка', en: 'Common roach' } },
    { label: { la: 'Rutilus sp.', bg: '', en: 'Roach' } },
    { label: { la: 'Scardinius erythrophthalmus', bg: 'Червеноперка', en: 'Rudd' } },
    { label: { la: 'Squalius cephalus', bg: 'Речен кефал', en: 'Common chub' } },
    { label: { la: 'Squalius orpheus', bg: 'Южен речен кефал', en: 'Maritza chub' } },
    { label: { la: 'Squalius sp.', bg: 'кефал', en: 'Chub' } },
    { label: { la: 'Telestes souffia', bg: 'Планински кефал', en: 'Riffle dace' } },
    { label: { la: 'Vimba melanops', bg: 'Маришки морунаш', en: 'Dark vimba' } },
    { label: { la: 'Vimba vimba', bg: 'Обикновен морунаш', en: 'Common vimba' } },
    { label: { la: 'Vimba sp.', bg: 'морунаш', en: 'Vimba' } },
    { label: { la: 'Ctenopharyngodon idella', bg: 'Бял амур', en: 'Grass carp' } },
    { label: { la: 'Mylopharyngodon piceus', bg: 'Черен амур', en: 'Black carp' } },
    { label: { la: 'Tinca tinca', bg: 'Лин', en: 'Tench' } },
    { label: { la: 'Cobitis elongata', bg: 'Голям щипок', en: 'Balkan spined loach' } },
    { label: { la: 'Cobitis elongatoides', bg: 'Обикновен щипок', en: 'Danubian spined loach' } },
    { label: { la: 'Cobitis pontica', bg: 'Странджански щипок', en: 'Strandzha spined loach' } },
    { label: { la: 'Cobitis strumicae', bg: 'Струмски щипок', en: 'Struma spined loach' } },
    { label: { la: 'Cobitis sp.', bg: 'щипок', en: 'Loach' } },
    { label: { la: 'Misgurnus fossilis', bg: 'Виюн', en: 'Weather loach' } },
    { label: { la: 'Sabanejewia balcanica', bg: 'Балкански щипок', en: 'Balkan golden loach' } },
    { label: { la: 'Sabanejewia bulgarica', bg: 'Български щипок', en: 'Bulgarian golden loach' } },
    { label: { la: 'Sabanejewia sp.', bg: '', en: 'Golden loach' } },
    { label: { la: 'Barbatula barbatula', bg: 'Обикновен гулеш', en: 'Stone loach' } },
    { label: { la: 'Oxynoemacheilus bureschi', bg: 'Струмски гулеш', en: 'Struma stone loach' } },
    { label: { la: 'Ameiurus nebulosus', bg: 'Американско сомче', en: 'Brown catfish' } },
    { label: { la: 'Ameiurus melas', bg: 'Черно сомче', en: 'Black catfish' } },
    { label: { la: 'Ameiurus sp.', bg: '', en: 'Bullhead' } },
    { label: { la: 'Ictalurus punctatus', bg: 'Петнисто сомче', en: 'Channel catfish' } },
    { label: { la: 'Silurus glanis', bg: 'Сом', en: 'European catfish' } },
    { label: { la: 'Silurus aristotelis', bg: 'Гръцки сом', en: 'Acheloos catfish' } },
    { label: { la: 'Silurus sp.', bg: '', en: 'Catfish' } },
    { label: { la: 'Esox lucius', bg: 'Щука', en: 'Pike' } },
    { label: { la: 'Umbra krameri', bg: 'Умбра', en: 'European mudminnow' } },
    { label: { la: 'Coregonus albula', bg: 'Ряпушка', en: 'Baltic whitefish' } },
    { label: { la: 'Coregonus marenoides', bg: 'Чудски сиг', en: 'Peipsi whitefish' } },
    { label: { la: 'Coregonus peled', bg: 'Пелед', en: 'Peled' } },
    { label: { la: 'Coregonus sp.', bg: '', en: 'Whitefish' } },
    { label: { la: 'Oncorhynchus mykiss', bg: 'Дъгова пъстърва', en: 'Rainbow trout' } },
    { label: { la: 'Salmo labrax', bg: 'Черноморска пъстърва', en: 'Black Sea trout' } },
    { label: { la: 'Salmo macedonicus', bg: 'Македонска пъстърва', en: 'Macedonian trout' } },
    { label: { la: 'Salmo trutta', bg: 'Речна пъстърва', en: 'Brown trout' } },
    { label: { la: 'Salmo sp.', bg: 'пъстърва', en: 'Trout' } },
    { label: { la: 'Salvelinus fontinalis', bg: 'Сивен', en: 'Brook char' } },
    { label: { la: 'Thymallus thymallus', bg: 'Липан', en: 'European grayling' } },
    { label: { la: 'Lota lota', bg: 'Речен налим', en: 'Burbot' } },
    { label: { la: 'Gaidropsarus mediterraneus', bg: 'Морски налим', en: 'Shore rockling' } },
    { label: { la: 'Merluccius merluccius', bg: 'Мерлуза', en: 'Hake' } },
    { label: { la: 'Merlangius merlangus', bg: 'Меджид', en: 'Whiting' } },
    { label: { la: 'Belone belone', bg: 'Зарган', en: 'Garfish' } },
    { label: { la: 'Chelon labrosus', bg: 'Дебелоуст кефал', en: 'Thicklip mullet' } },
    { label: { la: 'Liza aurata', bg: 'Платерина', en: 'Golden mullet' } },
    { label: { la: 'Liza haematocheilus', bg: 'Пеленгас', en: 'Soiyu mullet' } },
    { label: { la: 'Liza ramada', bg: 'Тънкоуст кефал', en: 'Thinlip mullet' } },
    { label: { la: 'Liza saliens', bg: 'Илария', en: 'Sharpnose mullet' } },
    { label: { la: 'Liza sp.', bg: '', en: 'Mullet' } },
    { label: { la: 'Mugil cephalus', bg: 'Морски кефал', en: 'Striped mullet' } },
    { label: { la: 'Atherina boyeri', bg: 'Атерина', en: 'Sand smelt' } },
    { label: { la: 'Atherina hepsetus', bg: 'Голяма атерина', en: 'Mediterranean sand smelt' } },
    { label: { la: 'Atherina sp. ', bg: '', en: 'Smelt' } },
    { label: { la: 'Gambusia holbrooki', bg: 'Гамбузия', en: 'Eastern mosquitofish' } },
    { label: { la: 'Poecilla reticulata', bg: 'Гупи', en: 'Guppy' } },
    { label: { la: 'Xiphorophorus helleri', bg: 'Хелер', en: 'Swordtail' } },
    { label: { la: 'Gasterosteus aculeatus', bg: 'Триигла бодливка', en: 'Threespine stickleback' } },
    { label: { la: 'Pungitius platygaster', bg: 'Деветигла бодливка', en: 'Ninespine stickleback' } },
    { label: { la: 'Nerophis ophidion', bg: 'Морско шило', en: 'Straightnose pipefish' } },
    { label: { la: 'Syngnathus abaster', bg: 'Черноивичеста морска игла', en: 'Shore pipefish' } },
    { label: { la: 'Syngnathus schmidti', bg: 'Шипчеста игла', en: 'Black Sea pelagic pipefish' } },
    { label: { la: 'Syngnathus tenuirostris', bg: 'Тънкомуцунеста игла', en: 'Narrow-snouted pipefish' } },
    { label: { la: 'Syngnathus typhle', bg: 'Високомуцунеста игла', en: 'Deep-snouted pipefish' } },
    { label: { la: 'Syngnathus variegatus', bg: 'Дебеломуцунеста игла', en: 'Variegated pipefish' } },
    { label: { la: 'Syngnathus sp. ', bg: 'морска игла', en: 'Pipefish' } },
    { label: { la: 'Hippocampus guttulatus', bg: 'Морско конче', en: 'Long-snouted seahorse' } },
    { label: { la: 'Zeus faber', bg: 'Светипетрова риба', en: 'John dory' } },
    { label: { la: 'Sphyraena sphyraena', bg: 'Баракуда', en: 'European barracuda' } },
    { label: { la: 'Cottus gobio', bg: 'Главоч', en: 'Common sculpin' } },
    { label: { la: 'Cottus haemusi', bg: 'Старопланински главоч', en: 'Vit sculpin' } },
    { label: { la: 'Cottus sp.', bg: '', en: 'Sculpin' } },
    { label: { la: 'Lepomis gibbosus', bg: 'Слънчева рибка', en: 'Pumpkinseed' } },
    { label: { la: 'Gymnocephalus baloni', bg: 'Високотел бибан', en: 'Danube ruffe' } },
    { label: { la: 'Gymnocephalus cernua', bg: 'Обикновен бибан', en: 'Common ruffe' } },
    { label: { la: 'Gymnocephalus schraetser', bg: 'Ивичест бибан', en: 'Striped ruffe' } },
    { label: { la: 'Gymnocephalus sp.', bg: 'бибан', en: 'Ruffe' } },
    { label: { la: 'Perca fluviatilis', bg: 'Речен костур', en: 'Perch' } },
    { label: { la: 'Sander lucioperca', bg: 'Обикновена бяла риба', en: 'Common pikeperch' } },
    { label: { la: 'Sander volgensis', bg: 'Волжка бяла риба', en: 'Volga pikeperch' } },
    { label: { la: 'Sander sp.', bg: '', en: 'Pikeperch' } },
    { label: { la: 'Zingel streber', bg: 'Малка вретенарка', en: 'Streber' } },
    { label: { la: 'Zingel zingel', bg: 'Голяма вретенарка', en: 'Zingel' } },
    { label: { la: 'Zingel sp.', bg: 'вретенарка', en: 'Zingel' } },
    { label: { la: 'Dicentrarchus labrax', bg: 'Лаврак', en: 'European sea bass' } },
    { label: { la: 'Serranus scriba', bg: 'Морски костур', en: 'Painted comber' } },
    { label: { la: 'Serranus cabrilla', bg: 'Ханос', en: 'Common comber' } },
    { label: { la: 'Serranus hepatus', bg: 'Ивичест морски костур', en: 'Brown comber' } },
    { label: { la: 'Serranus sp.', bg: '', en: 'Comber' } },
    { label: { la: 'Pomatomus saltatrix', bg: 'Лефер', en: 'Bluefish' } },
    { label: { la: 'Perccottus glenii', bg: 'Китайски поспаланко', en: 'Amur sleeper' } },
    { label: { la: 'Trachurus trachurus ', bg: 'Средиземноморски сафрид', en: 'Atlantic horse mackerel' } },
    { label: { la: 'Trachurus mediterraneus', bg: 'Черноморски сафрид', en: 'Mediterranean horse mackerel' } },
    { label: { la: 'Naucrates ductor', bg: 'Риба лоцман', en: 'Pilotfish' } },
    { label: { la: 'Lichia amia', bg: 'Лихия', en: 'Leerfish' } },
    { label: { la: 'Umbrina cirrosa', bg: 'Минокоп', en: 'Corb' } },
    { label: { la: 'Sciaena umbra', bg: 'Морска врана', en: 'Brown meagre' } },
    { label: { la: 'Dentex dentex', bg: 'Синегрид', en: 'Common dentex' } },
    { label: { la: 'Spondyliosoma cantharus', bg: 'Кантар', en: 'Black seabream' } },
    { label: { la: 'Pagellus erythrinus', bg: 'Мерджан', en: 'Common pandora' } },
    { label: { la: 'Sparus aurata', bg: 'Ципура', en: 'Gilthead seabream' } },
    { label: { la: 'Diplodus vulgaris', bg: 'Обикновена морска каракуда', en: 'Two-banded seabream' } },
    { label: { la: 'Diplodus sargus', bg: 'Ивичеста морска каракуда', en: 'White seabream' } },
    { label: { la: 'Diplodus annularis', bg: 'Спарид', en: 'Annular seabream' } },
    { label: { la: 'Diplodus puntazzo', bg: 'Морска хиена', en: 'Sharpsnout seabream' } },
    { label: { la: 'Diplodus sp.', bg: 'Морска каракуда', en: 'Seabream' } },
    { label: { la: 'Oblada melanura', bg: 'Меланура', en: 'Saddled seabream' } },
    { label: { la: 'Boops boops', bg: 'Гопа', en: 'Bogue' } },
    { label: { la: 'Sarpa salpa', bg: 'Сарпа', en: 'Salema' } },
    { label: { la: 'Spicara smaris', bg: 'Смарид', en: 'Picarel' } },
    { label: { la: 'Spicara maena', bg: 'Тъмен смарид', en: 'Mendole' } },
    { label: { la: 'Spicara flexuosa', bg: 'Златист смарид', en: 'Garizzo' } },
    { label: { la: 'Spicara sp. ', bg: '', en: 'Spicara' } },
    { label: { la: 'Mullus barbatus', bg: 'Барбуня', en: 'Red mullet' } },
    { label: { la: 'Chromis chromis', bg: 'Кестенка', en: 'Damselfish' } },
    { label: { la: 'Coris julis', bg: 'Морски юнкер', en: 'Rainbow wrasse' } },
    { label: { la: 'Symphodus roissali', bg: 'Петниста лапина', en: 'Five-spotted wrasse' } },
    { label: { la: 'Symphodus cinereus', bg: 'Сива лапина', en: 'Grey wrasse' } },
    { label: { la: 'Symphodus ocellatus', bg: 'Очилата зеленушка', en: 'Ocellated wrasse' } },
    { label: { la: 'Symphodus tinca', bg: 'Обикновена зеленушка', en: 'Peacock wrasse' } },
    { label: { la: 'Symphodus sp.', bg: 'Зеленушка', en: 'Wrasse' } },
    { label: { la: 'Ctenolabrus rupestris', bg: 'Лапина', en: 'Goldsinny wrasse' } },
    { label: { la: 'Trachinus draco', bg: 'Морски дракон', en: 'Greater weever' } },
    { label: { la: 'Uranoscopus scaber', bg: 'Звездоброец', en: 'Stargazer' } },
    { label: { la: 'Salaria pavo', bg: 'Морски паун', en: 'Peacock blenny' } },
    { label: { la: 'Blennius ocellaris ', bg: 'Очилата морска кучка', en: 'Butterfly blenny' } },
    { label: { la: 'Aidablennius sphynx', bg: 'Малка морска кучка', en: 'Sphinx blenny' } },
    { label: { la: 'Parablennius sanguinolentus', bg: 'Ръждива морска кучка', en: 'Rusty blenny' } },
    { label: { la: 'Parablennius tentacularis', bg: 'Рогата морска кучка', en: 'Tentacled blenny' } },
    { label: { la: 'Parablennius zvonimiri', bg: 'Звонимира', en: 'Zvonimir\'s blenny' } },
    { label: { la: 'Parablennius sp.', bg: 'морска кучка', en: 'Blenny' } },
    { label: { la: 'Coryphoblennius galerita', bg: 'Качулата морска кучка', en: 'Montagu\'s blenny' } },
    { label: { la: 'Ophidion rochei', bg: 'Еврейско попче', en: 'Smooth cusk eel' } },
    { label: { la: 'Gymnammodytes cicerellus', bg: 'Ува', en: 'Mediterranean smooth sandeel' } },
    { label: { la: 'Callionymus risso', bg: 'Малка морска мишка', en: 'Risso\'s dragonet' } },
    { label: { la: 'Callionymus pusillus', bg: 'Ивичеста морска мишка', en: 'Festive dragonet' } },
    { label: { la: 'Callionymus sp.', bg: 'морска мишка', en: 'Dragonet' } },
    { label: { la: 'Chelidonichthys lucerna', bg: 'Морска лястовица', en: 'Tub gurnard' } },
    { label: { la: 'Scomber scombrus', bg: 'Черноморска скумрия', en: 'Atlantic mackerel' } },
    { label: { la: 'Scomber colias', bg: 'Средиземноморска скумрия', en: 'Atlantic chub mackerel' } },
    { label: { la: 'Scomber sp.', bg: 'скумрия', en: 'Mackerel' } },
    { label: { la: 'Thunnus thynnus', bg: 'Тунец', en: 'Atlantic bluefin tuna' } },
    { label: { la: 'Euthynnus alletteratus', bg: 'Малък тунец', en: 'Little tunny' } },
    { label: { la: 'Sarda sarda', bg: 'Паламуд', en: 'Atlantic bonito' } },
    { label: { la: 'Xiphias gladius', bg: 'Риба меч', en: 'Swordfish' } },
    { label: { la: 'Scorpaena porcus', bg: 'Скорпид', en: 'Black scorpionfish' } },
    { label: { la: 'Scorpaena notata', bg: 'Малък скорпид', en: 'Small red scorpionfish' } },
    { label: { la: 'Aphia minuta', bg: 'Стъклено попче', en: 'Transparent goby' } },
    { label: { la: 'Benthophiloides brauneri', bg: 'Шабленско попче', en: 'Brauner\'s goby' } },
    { label: { la: 'Benthophilus nudus', bg: 'Звездовидно попче', en: 'Black Sea tadpole-goby' } },
    { label: { la: 'Chromogobius quadrivittatus', bg: 'Мраморноглаво попче', en: 'Chestnut goby' } },
    { label: { la: 'Gobius bucchichi', bg: 'Ивичесто попче', en: 'Bucchich\'s goby' } },
    { label: { la: 'Gobius cobitis', bg: 'Кадънка', en: 'Giant goby' } },
    { label: { la: 'Gobius niger', bg: 'Черно попче', en: 'Black goby' } },
    { label: { la: 'Gobius sp.', bg: '', en: 'Goby' } },
    { label: { la: 'Knipowitschia caucasica', bg: 'Кавказко попче', en: 'Caucasian dwarf goby' } },
    { label: { la: 'Knipowitschia longecaudata', bg: 'Дългоопашато попче', en: 'Longtail dwarf goby' } },
    { label: { la: 'Knipowitschia sp.', bg: '', en: 'Dwarf goby' } },
    { label: { la: 'Mesogobius batrachocephalus', bg: 'Лихнус', en: 'Knout goby' } },
    { label: { la: 'Neogobius cephalargoides ', bg: 'Голямоглаво попче', en: 'Surman goby' } },
    { label: { la: 'Neogobius eurycephalus', bg: 'Широкоглаво попче', en: 'Ginger goby' } },
    { label: { la: 'Neogobius fluviatilis', bg: 'Речно попче', en: 'Pontian monkey goby' } },
    { label: { la: 'Neogobius gymnotrachelus', bg: 'Малко плоскоглаво попче', en: 'Racer goby' } },
    { label: { la: 'Neogobius kessleri', bg: 'Кеслерово попче', en: 'Bighead goby' } },
    { label: { la: 'Neogobius melanostomus', bg: 'Стронгил', en: 'Round goby' } },
    { label: { la: 'Neogobius ratan', bg: 'Ратан', en: 'Ratan goby' } },
    { label: { la: 'Neogobius syrman', bg: 'Сирман', en: 'Syrman goby' } },
    { label: { la: 'Neogobius sp.', bg: '', en: 'Goby' } },
    { label: { la: 'Pomatoschistus bathi', bg: 'Пелагично далаче', en: 'Bath\'s goby' } },
    { label: { la: 'Pomatoschistus marmoratus', bg: 'Пъстро попче', en: 'Marbled goby' } },
    { label: { la: 'Pomatoschistus minutus', bg: 'Малко попче', en: 'Sand goby' } },
    { label: { la: 'Pomatoschistus sp.', bg: '', en: 'Pomatoschistus' } },
    { label: { la: 'Proterorhinus semilunaris', bg: 'Мраморно попче', en: 'Western tubenose goby' } },
    { label: { la: 'Zosterisessor ophiocephalus', bg: 'Тревно попче', en: 'Grass goby' } },
    { label: { la: 'Scophthalmus rhombus', bg: 'Средиземноморски калкан', en: 'Brill' } },
    { label: { la: 'Scophthalmus maximus', bg: 'Черноморски калкан', en: 'Turbot' } },
    { label: { la: 'Scophthalmus sp.', bg: 'калкан', en: 'Turbot' } },
    { label: { la: 'Arnoglossus kessleri', bg: 'Кеслерово калканче', en: 'Scaldback' } },
    { label: { la: 'Platichthys flesus', bg: 'Писия', en: 'Flounder' } },
    { label: { la: 'Pegusa nasuta', bg: 'Морски език', en: 'Snouted sole' } },
    { label: { la: 'Lophius piscatorius', bg: 'Морски дявол', en: 'Anglerfish' } },
    { label: { la: 'Lepadogaster lepadogaster', bg: 'Обикновено малко прилепало', en: 'Shore clingfish' } },
    { label: { la: 'Lepadogaster candollii', bg: 'Дебеломуцунесто малко прилепало', en: 'Connemara clingfish' } },
    { label: { la: 'Diplecogaster bimaculata', bg: 'Петнисто малко прилепало', en: 'Two-spotted clingfish' } },
    { label: { la: 'Echeneis naucrates', bg: 'Прилепало', en: 'Striped suckerfish' } }
  ]
}

const nomenclatureValues = Object.entries(nomenclatures).flatMap(([type, values]) => values.map((value) => ({
  createdAt: new Date(),
  updatedAt: new Date(),
  type,
  ...Object.fromEntries(Object.keys(value.label).map(lang => [`label${capitalizeFirstLetter(lang)}`, value.label[lang]]))
})))

const speciesValues = Object.entries(species).flatMap(([type, values]) => values.map((value) => ({
  createdAt: new Date(),
  updatedAt: new Date(),
  type,
  ...Object.fromEntries(Object.keys(value.label).map(lang => [`label${capitalizeFirstLetter(lang)}`, value.label[lang]]))
})))

const deleteExistingValues = (queryInterface) => Promise.all([
  queryInterface.bulkDelete('Nomenclatures', {
    type: {
      [Sequelize.Op.in]: Object.keys(nomenclatures)
    }
  }),
  queryInterface.bulkDelete('Species', {
    type: {
      [Sequelize.Op.in]: Object.keys(species)
    }
  })
])

module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable(tableName, {
      autoLocationEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      autoLocationLocal: DataTypes.TEXT,
      autoLocationLang: Sequelize.STRING(3),
      observationMethodologyEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      observationMethodologyLocal: DataTypes.TEXT,
      observationMethodologyLang: Sequelize.STRING(3),
      moderatorReview: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      sourceEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sourceLocal: DataTypes.TEXT,
      sourceLang: DataTypes.STRING(3),
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      observationDateTime: DataTypes.DATE,
      monitoringCode: DataTypes.TEXT,
      endDateTime: DataTypes.DATE,
      startDateTime: DataTypes.DATE,
      observers: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rainEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rainLocal: DataTypes.TEXT,
      rainLang: DataTypes.STRING(3),
      temperature: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      windDirectionEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      windDirectionLocal: DataTypes.TEXT,
      windDirectionLang: DataTypes.STRING(3),
      windSpeedEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      windSpeedLocal: DataTypes.TEXT,
      windSpeedLang: DataTypes.STRING(3),
      cloudinessEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cloudinessLocal: DataTypes.TEXT,
      cloudinessLang: DataTypes.STRING(3),
      cloudsType: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      visibility: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      mto: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      threatsEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      threatsLocal: DataTypes.TEXT,
      threatsLang: DataTypes.STRING(3),
      pictures: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      track: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      confidential: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      geolocationAccuracy: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      location: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      userId: DataTypes.INTEGER,
      organization: DataTypes.TEXT,
      imported: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      species: DataTypes.TEXT,
      count: DataTypes.INTEGER,
      nameWaterBody: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sexEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sexLocal: DataTypes.TEXT,
      sexLang: DataTypes.STRING(3),
      ageEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ageLocal: DataTypes.TEXT,
      ageLang: DataTypes.STRING(3),
      sizeTL_mm: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      siteSL_mm: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      masa_gr: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      findingsEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      findingsLocal: DataTypes.TEXT,
      findingsLang: DataTypes.STRING(3),
      monitoringTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      monitoringTypeLocal: DataTypes.TEXT,
      monitoringTypeLang: DataTypes.STRING(3),
      transectLength_M: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      transectWidth_M: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      fishingArea_M: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      exposition: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      meshSize: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      countNetTrap: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      waterTemp: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      conductivity: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      pH: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      o2mgL: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      o2percent: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      salinity: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      habitatDescriptionTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      habitatDescriptionTypeLocal: DataTypes.TEXT,
      habitatDescriptionTypeLang: DataTypes.STRING(3),
      substrateMud: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateSilt: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateSand: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateGravel: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateSmallStones: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateCobble: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateBoulder: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateRock: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      substrateOther: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      waterLevelEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      waterLevelLocal: DataTypes.TEXT,
      waterLevelLang: DataTypes.STRING(3),
      riverCurrentEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      riverCurrentLocal: DataTypes.TEXT,
      riverCurrentLang: DataTypes.STRING(3),
      transectAvDepth: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      transectMaxDepth: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      slopeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      slopeLocal: DataTypes.TEXT,
      slopeLang: DataTypes.STRING(3),
      bankTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      bankTypeLocal: DataTypes.TEXT,
      bankTypeLang: DataTypes.STRING(3),
      shading: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      riparianVegetation: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      sheltersEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sheltersLocal: DataTypes.TEXT,
      sheltersLang: DataTypes.STRING(3),
      transparency: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      vegetationTypeEn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      vegetationTypeLocal: DataTypes.TEXT,
      vegetationTypeLang: DataTypes.STRING(3),
      speciesNotes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,

      // base
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        ...(queryInterface.sequelize.options.dialect === 'postgres'
          ? {
              defaultValue: Sequelize.literal('nextval(\'"FormBirds_id_seq"\')')
            }
          : {
              autoIncrement: true
            })
      },
      hash: Sequelize.STRING(64)
    })

    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
    await Promise.all([
      queryInterface.bulkInsert('Nomenclatures', nomenclatureValues),
      queryInterface.bulkInsert('Species', speciesValues)
    ])
  },

  async down (queryInterface) {
    await queryInterface.dropTable(tableName)
    // we use hard-coded IDs for the nomenclatures in test fixtures and fixtures cannot be applied if the migration is executed
    if (queryInterface.sequelize.options.dialect !== 'postgres') {
      return
    }
    await deleteExistingValues(queryInterface)
  }
}
