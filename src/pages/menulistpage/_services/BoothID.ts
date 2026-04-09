// _services/BoothService.ts
import { instance } from '@services/instance';

type BoothNameResp = {
  status: string;
  message: string;
  code: number;
  data?: { booth_id: number; booth_name: string };
};

export const BoothID = {
  async getName(boothId: number): Promise<string> {
    const res = await instance.get<BoothNameResp>(
      `/api/v3/django/booth/${boothId}/name/`,
      { params: { booth_id: boothId } },
    );
    return res.data?.data?.booth_name ?? '';
  },
};
