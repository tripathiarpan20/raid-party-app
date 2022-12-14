/* eslint-disable */
// API DOC https://cryptoavatars.io/integrations
// NFT Filter DTO SCHEMA at the end of the document

// SKIP & LIMIT supported for pagination on URL params

export const cryptoavatarsCharactersUtil = {
  getCryptoAvatars,
  getCryptoAvatarsFilters,
};

const defaultCollectionName = 'CryptoAvatars';

async function loadCryptoAvatarsCharacters(
  url = undefined,
  ownership = undefined,
  collectionName = defaultCollectionName,
  itemsPerPage = 5,
  walletAddress,
) {
  const apiUrl = !url
    ? 'https://api.cryptoavatars.io/v1/nfts/avatars/list?skip=0&limit=' +
      itemsPerPage
    : url;

  var filter = {
    collectionName,
    owner: ownership,
  };

  if (ownership && ownership === 'opensource') {
    filter.owner = undefined;
    filter.license = 'CC0';
  }
  if (ownership && ownership === 'all') {
    filter.owner = undefined;
  }
  if (ownership && ownership === 'owned') {
    filter.owner = walletAddress;
  }

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      'API-KEY': '$2b$10$Yaenvbe2pRfadxqZT0vOHet50SX6NEbdSQ5lrqV.M7on2hRKkCC/6',
    },
    body: JSON.stringify(filter),
  };

  try {
    console.log('res launching', filter, options);
    const res = await fetch(apiUrl, options);

    if (!res.ok) {
      console.error(
        'Bad response from CA avatars list endpoint',
        res.statusText,
      );
      return;
    }

    const caResponse = await res.json();
    console.log('caRespnose', caResponse);
    const avatarsWebaverseFormat = caResponse.nfts.map(avatar => {
      const avatarClass = avatar.metadata.tags
        ? avatar.metadata.tags[0]
        : avatar.metadata.attributes[0].value;

      return {
        name: avatar.metadata.name,
        canBeUsed: !!(
          (avatar.metadata.licenses &&
            avatar.metadata.licenses.license === 'CC0') ||
          avatar.owner === ownership
        ),
        previewUrl: avatar.metadata.image,
        avatarUrl: avatar.metadata.asset,
        voice: 'Maud Pie',
        class: avatarClass,
        bio: avatar.metadata.description.slice(0, 8) + '...',
      };
    });

    //console.log('CAResponse', caResponse);

    return {
      avatars: avatarsWebaverseFormat,
      pagination: {
        currentPage: caResponse.currentPage,
        totalPages: caResponse.totalPages,
        totalNfts: caResponse.totalNfts,
        next: caResponse.next,
        prev: caResponse.prev,
      },
    };
  } catch (err) {
    console.error('Error fetching data form CryptoAvatars', err);
  }
}

async function getCryptoAvatars(
  url = undefined,
  ownership,
  collection,
  itemsPerPage,
  walletAddress,
) {
  const caResponse = await loadCryptoAvatarsCharacters(
    url,
    ownership,
    collection,
    itemsPerPage,
    walletAddress,
  );
  return caResponse;
}

async function GetNFTsCollections() {
  try {
    const apiUrlCollections =
      'https://api.cryptoavatars.io/v1/collections/list?skip=0&limit=20';
    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'API-KEY':
          '$2b$10$Yaenvbe2pRfadxqZT0vOHet50SX6NEbdSQ5lrqV.M7on2hRKkCC/6',
      },
      body: '{}',
    };
    console.log('NFTs collection launching', options);
    const res = await fetch(apiUrlCollections, options);
    if (!res.ok) {
      console.error(
        'Bad response from CA NFTsCollections list endpoint',
        res.statusText,
      );
      return;
    } else {
      const caResponse = await res.json();
      return caResponse;
    }
  } catch (err) {
    console.error('Error fetching data from NFTsCollections', err);
  }
}

async function getCryptoAvatarsFilters() {
  return await GetNFTsCollections;
}

/*
export enum LicensesEnum {
  CC0,
  CC_BY,
  Redistribution_Prohibited,
  CC_BY_NC_SA
}
export class FilterNFTsDto {
  @ApiProperty({ description: 'Blockchain Network.', required: false, enum: NFTBlockchainNetwork })
  @IsEnum(NFTBlockchainNetwork)
  @IsOptional()
  readonly network: NFTBlockchainNetwork;
  @ApiProperty({ description: 'Collection contract address of nft.', required: false, type: 'Ethereum address' })
  @IsEthereumAddress()
  @IsOptional()
  readonly collectionAddress: string;
  @ApiProperty({ description: 'NFT collection name.', required: false, type: 'string' })
  @IsString()
  @IsOptional()
  readonly collectionName: string;
  @ApiProperty({ description: 'Token ID inside of the blockchain contract.', required: false, type: 'string' })
  @IsString()
  @IsOptional()
  readonly nftId: string;
  @ApiProperty({ description: "Creator's wallet.", required: false, type: 'string' })
  @IsString()
  @IsOptional()
  readonly createdBy: string;
  @ApiProperty({ description: 'NFT tags.', required: false, type: 'array', items: { type: 'string', }, })
  @IsArray()
  @IsOptional()
  readonly tags: [string];
  @ApiProperty({ description: 'Name of the NFT (also partially name).', required: false, type: 'string' })
  @IsString()
  @IsOptional()
  readonly name: string;
  @ApiProperty({
    name: 'sort', type: 'object', required: false,
    properties: {
      sortName: { description: 'NFT schema field desired to sort data.', type: 'string', },
      sortOrder: { description: 'Data sorted asc or desc (1 / -1).', type: 'number', },
    },
  })
  @IsOptional()
  readonly sort: {
    readonly sortField?: string;
    readonly sortOrder?: number;
  };
  @ApiProperty({ description: 'Wallet who belongs the NFT.', required: false, })
  @IsEthereumAddress()
  @IsOptional()
  readonly owner: string;
  @ApiProperty({ description: 'Use licenses. CC0 for free use.', required: false, enum: LicensesEnum })
  @IsString()
  @IsOptional()
  readonly license: string;
}
*/
